from rest_framework import generics, status
from rest_framework.response import Response
from django.utils import timezone
from asiko_connect.utils.variables import PASSAGE_PHASE_1,MESSAGE_A_VOCAL
from .models import Prediction
from .serializers import SensorMeasurementSerializer
from asiko_connect.utils.calculs import calculate_trend, calculate_curb65, risk_level, calculate_air_quality_index
from asiko_connect.apps.alerts.models import Alert
from asiko_connect.apps.sensors.ml_model import ml_model
from asiko_connect.apps.users.models import User
from rest_framework.views import APIView
from .models import Sensor, AirQualityMeasurement
from asiko_connect.apps.alerts.models import Alert
from asiko_connect.apps.alerts.tasks import phase1_timer_task
from asiko_connect.utils.calculs import calculate_air_quality_index, SEUIL_CRITIQUE
from asiko_connect.utils.notify import notify_frontend
from django.http import StreamingHttpResponse
from queue import Queue
from asiko_connect.utils.notify import clients

class SensorMeasurementCreateView(generics.CreateAPIView):
    serializer_class = SensorMeasurementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Récupérer l'utilisateur
        user = serializer.validated_data['user']

        # Vérifier que le patient a des données statiques
        try:
            patient_data = user.patient_data
        except User.patient_data.RelatedObjectDoesNotExist:
            return Response(
                {"error": "PatientData non trouvé pour cet utilisateur."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Dernières mesures pour calcul des deltas et tendances
        last_measurements = user.sensor_measurements.order_by('-created_at')[:5]

        def get_last(field):
            return getattr(last_measurements[0], field) if last_measurements else None

        current = serializer.validated_data

        delta_rr = current['respiratory_rate'] - get_last('respiratory_rate') if get_last('respiratory_rate') is not None else 0
        delta_spo2 = current['spo2'] - get_last('spo2') if get_last('spo2') is not None else 0
        delta_wbc = current['wbc'] - get_last('wbc') if get_last('wbc') is not None else 0

        rr_trend = calculate_trend([m.respiratory_rate for m in last_measurements], current['respiratory_rate'])
        spo2_trend = calculate_trend([m.spo2 for m in last_measurements], current['spo2'])

        # Calculer Curb65
        curb65 = calculate_curb65(
            age=patient_data.age,
            confusion=False,
            bun_high=False,
            respiratory_rate=current['respiratory_rate'],
            systolic_bp=current['systolic_bp'],
            diastolic_bp=70
        )

        # Créer la mesure
        measurement = serializer.save(
            delta_respiratory_rate=delta_rr,
            delta_spo2=delta_spo2,
            delta_wbc=delta_wbc,
            rr_trend=rr_trend,
            spo2_trend=spo2_trend,
            curb65=curb65
        )

        # Préparer le vecteur pour le modèle ML
        X = [
            patient_data.age,
            int(patient_data.smoking),
            int(patient_data.diabetes),
            int(patient_data.copd_asthma),
            int(patient_data.immunosuppression),
            measurement.temperature,
            measurement.respiratory_rate,
            measurement.heart_rate,
            measurement.spo2,
            measurement.systolic_bp,
            measurement.wbc,
            measurement.curb65,
            measurement.delta_respiratory_rate,
            measurement.delta_spo2,
            measurement.delta_wbc,
            measurement.rr_trend,
            measurement.spo2_trend
        ]

        # Calcul de la prédiction ML avec probabilité + niveau de risque
        try:
            prob = float(ml_model.predict_proba([X])[0][1])
            risk = risk_level(prob)
        except Exception as e:
            return Response(
                {"error": f"ML prediction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Stocker la prédiction
        Prediction.objects.create(
            user=user,
            input_data=X,
            result={
                "probabilite_pneumonie_72h": round(prob, 3),
                "niveau_risque": risk
            }
        )

        # Retourner la réponse avec mesure + prédiction
        return Response({
            "measurement": SensorMeasurementSerializer(measurement).data,
            "prediction": {
                "probabilite_pneumonie_72h": round(prob, 3),
                "niveau_risque": risk
            },
            "features_used": X
        }, status=status.HTTP_201_CREATED)


class SensorDataAPIView(APIView):
    def post(self, request):
        sensor = Sensor.objects.get(device_id=request.data["device_id"])

        result = calculate_air_quality_index(
            request.data["pm25"],
            request.data["pm10"],
            request.data["o3"],
            request.data["no2"],
            request.data["so2"],
            request.data["co"],
            request.data["humidity"],
            request.data["temperature"],
        )

        # 🔍 Recherche d’une alerte active
        active_alert = Alert.objects.filter(
            sensor=sensor,
            is_active=True
        ).first()

        # 🚨 CAS 1 : Pas d’alerte active → on en crée UNE
        if result["trigger_alert"] and not active_alert:
            alert = Alert.objects.create(
                sensor=sensor,
                phase=Alert.PHASE_1,
                phase_1_started_at=timezone.now(),
                is_active=True
            )
            notify_frontend(MESSAGE_A_VOCAL)

            # ⏱️ TIMER PHASE 1 → 15 secondes ou PASSAGE_PHASE_1
            phase1_timer_task.apply_async(
                args=[alert.id],
                countdown=PASSAGE_PHASE_1
            )
        else:
            alert = active_alert  # Peut être None si aucune alerte n'est active

        # 🧠 Création de la mesure avec l'alerte existante
        measurement = AirQualityMeasurement.objects.create(
            sensor=sensor,
            alert=alert,  # Peut être None si pas de trigger_alert
            pm25=request.data["pm25"],
            pm10=request.data["pm10"],
            o3=request.data["o3"],
            no2=request.data["no2"],
            so2=request.data["so2"],
            co=request.data["co"],
            humidity=request.data["humidity"],
            temperature=request.data["temperature"],
            iqa=result["iqa"],
            category=result["category"],
            advice=result["advice"],
            )
        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)



def sse_notifications(request):
    """
    Endpoint SSE pour que le frontend reçoive les messages en temps réel.
    """
    client_queue = Queue()
    clients.append(client_queue)

    def event_stream():
        try:
            while True:
                message = client_queue.get()  # attend un message
                yield f"data: {message}\n\n"  # format SSE
        except GeneratorExit:
            # Quand le client se déconnecte, on enlève sa queue
            clients.remove(client_queue)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
