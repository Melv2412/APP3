from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.db.models import Q, Prefetch
from datetime import datetime, timedelta

from asiko_connect.utils.variables import PASSAGE_PHASE_1, MESSAGE_A_VOCAL
from .models import Prediction, SensorMeasurement, Sensor, AirQualityMeasurement
from .serializers import SensorMeasurementSerializer, PredictionSerializer
from asiko_connect.utils.calculs import calculate_trend, calculate_curb65, risk_level, calculate_air_quality_index
from asiko_connect.apps.alerts.models import Alert
from asiko_connect.apps.sensors.ml_model import ml_model
from asiko_connect.apps.users.models import User
from asiko_connect.apps.users.permissions import IsOwnerOrDoctor
from rest_framework.views import APIView

from asiko_connect.apps.alerts.tasks import phase1_timer_task

from asiko_connect.utils.calculs import SEUIL_CRITIQUE
from asiko_connect.utils.notify import notify_frontend, notify_aqi_update  

from django.http import StreamingHttpResponse




class SensorMeasurementCreateView(generics.CreateAPIView):
    serializer_class = SensorMeasurementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        current = serializer.validated_data

        # Récupérer l'utilisateur avec patient_data et dernières mesures en une seule requête
        user = User.objects.select_related('patient_data').prefetch_related(
            Prefetch(
                'sensor_measurements',
                queryset=SensorMeasurement.objects.order_by('-created_at')[:5],
                to_attr='last_measurements'
            )
        ).get(id=current['user'].id)

        # Vérifier PatientData
        if not hasattr(user, 'patient_data') or user.patient_data is None:
            return Response({"error": "PatientData non trouvé pour cet utilisateur."},
                            status=status.HTTP_400_BAD_REQUEST)

        last_measurements = getattr(user, 'last_measurements', [])

        # Calculer deltas et trends
        last = last_measurements[0] if last_measurements else None
        delta_rr = current['respiratory_rate'] - last.respiratory_rate if last else 0
        delta_spo2 = current['spo2'] - last.spo2 if last else 0
        delta_wbc = current['wbc'] - last.wbc if last else 0

        rr_trend = calculate_trend([m.respiratory_rate for m in last_measurements], current['respiratory_rate'])
        spo2_trend = calculate_trend([m.spo2 for m in last_measurements], current['spo2'])

        # Calculer Curb65
        curb65 = calculate_curb65(
            age=user.patient_data.age,
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

        # Préparer vecteur ML
        X = [
            user.patient_data.age,
            int(user.patient_data.smoking),
            int(user.patient_data.diabetes),
            int(user.patient_data.copd_asthma),
            int(user.patient_data.immunosuppression),
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

        # Prédiction ML

        try:
            prob = float(ml_model.predict_proba([X])[0][1])
            risk = risk_level(prob)
        except Exception as e:
            return Response({"error": f"ML prediction failed: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Stocker la prédiction
        Prediction.objects.create(
            user=user,
            input_data=X,
            result={"probabilite_pneumonie_72h": round(prob, 3), "niveau_risque": risk}
        )

        # Retourner réponse
        return Response({
            "measurement": SensorMeasurementSerializer(measurement).data,
            "prediction": {"probabilite_pneumonie_72h": round(prob, 3), "niveau_risque": risk},
            "features_used": X
        }, status=status.HTTP_201_CREATED)







class SensorMeasurementViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des mesures de capteurs.
    
    Permissions :
    - Patients : peuvent voir et modifier uniquement leurs propres mesures
    - Médecins : peuvent voir toutes les mesures
    """
    serializer_class = SensorMeasurementSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['user', 'created_at']
    ordering_fields = ['created_at', 'temperature', 'respiratory_rate', 'spo2']
    ordering = ['-created_at']
    search_fields = ['user__username', 'user__email']
    
    def get_queryset(self):
        """Retourne les mesures selon les permissions."""
        user = self.request.user
        
        queryset = SensorMeasurement.objects.select_related('user').all()
        
        # Filtres par date
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            try:
                date_from = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__gte=date_from)
            except (ValueError, AttributeError):
                pass
        
        if date_to:
            try:
                date_to = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__lte=date_to)
            except (ValueError, AttributeError):
                pass
        
        # Permissions
        if user.is_doctor or user.is_admin:
            # Les médecins voient toutes les mesures
            return queryset
        else:
            # Les patients voient uniquement leurs propres mesures
            return queryset.filter(user=user)
    
    def perform_create(self, serializer):
        """Crée une nouvelle mesure."""
        # Si user_id n'est pas fourni, utiliser l'utilisateur connecté
        if 'user_id' not in serializer.validated_data:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'], url_path='latest')
    def latest(self, request):
        """
        Retourne la dernière mesure de l'utilisateur connecté.
        GET /api/sensors/measurements/latest/
        """
        user = request.user
        if not user.is_authenticated:
            return Response(
                {"error": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        queryset = self.get_queryset().filter(user=user)
        latest_measurement = queryset.first()
        
        if not latest_measurement:
            return Response(
                {"message": "Aucune mesure trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(latest_measurement)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='trends')
    def trends(self, request):
        """
        Retourne les tendances des mesures sur une période.
        GET /api/sensors/measurements/trends/?days=7
        """
        user = request.user
        if not user.is_authenticated:
            return Response(
                {"error": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)
        
        queryset = self.get_queryset().filter(created_at__gte=start_date)
        if not user.is_doctor:
            queryset = queryset.filter(user=user)
        
        measurements = queryset.order_by('created_at')
        
        # Calculer les tendances
        trends = {
            'respiratory_rate': {
                'values': [m.respiratory_rate for m in measurements],
                'trend': calculate_trend([m.respiratory_rate for m in measurements[:-1]], measurements[-1].respiratory_rate) if len(measurements) > 1 else 0
            },
            'spo2': {
                'values': [m.spo2 for m in measurements],
                'trend': calculate_trend([m.spo2 for m in measurements[:-1]], measurements[-1].spo2) if len(measurements) > 1 else 0
            },
            'temperature': {
                'values': [m.temperature for m in measurements],
                'trend': calculate_trend([m.temperature for m in measurements[:-1]], measurements[-1].temperature) if len(measurements) > 1 else 0
            },
        }
        
        return Response({
            'period_days': days,
            'measurements_count': measurements.count(),
            'trends': trends
        })


class PredictionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la consultation des prédictions ML.
    
    Permissions :
    - Patients : peuvent voir uniquement leurs propres prédictions
    - Médecins : peuvent voir toutes les prédictions
    """
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['user', 'created_at']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Retourne les prédictions selon les permissions."""
        user = self.request.user
        
        queryset = Prediction.objects.select_related('user').all()
        
        # Filtres par date
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            try:
                date_from = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__gte=date_from)
            except (ValueError, AttributeError):
                pass
        
        if date_to:
            try:
                date_to = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__lte=date_to)
            except (ValueError, AttributeError):
                pass
        
        # Permissions
        if user.is_doctor or user.is_admin:
            return queryset
        else:
            return queryset.filter(user=user)
    
    @action(detail=False, methods=['get'], url_path='latest')
    def latest(self, request):
        """
        Retourne la dernière prédiction de l'utilisateur connecté.
        GET /api/sensors/predictions/latest/
        """
        user = request.user
        if not user.is_authenticated:
            return Response(
                {"error": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        queryset = self.get_queryset().filter(user=user)
        latest_prediction = queryset.first()
        
        if not latest_prediction:
            return Response(
                {"message": "Aucune prédiction trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(latest_prediction)
        return Response(serializer.data)


class SensorDataAPIView(APIView):
    def post(self, request):
        sensor = Sensor.objects.get(device_id=request.data["device_id"])

        # 🆕 Mise à jour de la position GPS de la zone si fournie
        if "latitude" in request.data and "longitude" in request.data:
            latitude = request.data.get("latitude")
            longitude = request.data.get("longitude")
            if latitude is not None and longitude is not None:
                sensor.zone.latitude = float(latitude)
                sensor.zone.longitude = float(longitude)
                sensor.zone.save()
                print(f"[GPS] Zone '{sensor.zone.name}' mise à jour: ({latitude}, {longitude})")

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
            notify_frontend(
                message=MESSAGE_A_VOCAL,
                alert_id=alert.id,
                phase=alert.phase
            )

            # 🎯 Génération d'actions préventives pour Phase 1 (avertissement)
            try:
                from asiko_connect.apps.treatments.services import generate_prevention_actions_for_alert
                actions = generate_prevention_actions_for_alert(alert)
                print(f"[ACTIONS] {len(actions)} action(s) préventive(s) générée(s) pour Phase 1")
            except Exception as e:
                print(f"[ACTIONS] Erreur lors de la génération d'actions: {e}")

            # ⏱️ TIMER PHASE 1 → 15 secondes ou PASSAGE_PHASE_1
            if phase1_timer_task is not None:
                phase1_timer_task.apply_async(
                    args=[alert.id],
                    countdown=PASSAGE_PHASE_1
                )
            else:
                # Celery n'est pas disponible, les tâches asynchrones sont désactivées
                print(f"[WARNING] Celery not available. Alert {alert.id} created but async task not started.")
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

        # 📡 BROADCAST IQA LIVE (SSE)
        notify_aqi_update(result["iqa"], sensor.id)
        
        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)


