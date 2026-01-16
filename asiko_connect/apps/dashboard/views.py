from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from asiko_connect.apps.alerts.models import Alert
from asiko_connect.apps.community.models import RiskZone
from asiko_connect.apps.environment.models import EnvironmentData
from asiko_connect.apps.health_profiles.models import HealthProfile
from asiko_connect.apps.sensors.models import Prediction, SensorMeasurement
from asiko_connect.apps.users.models import User
from asiko_connect.apps.users.permissions import IsDoctor
from asiko_connect.apps.treatments.models import PreventionAction

from .serializers import (
    AlertEntrySerializer,
    EnvironmentEntrySerializer,
    MeasurementEntrySerializer,
    PredictionEntrySerializer,
    PreventionActionEntrySerializer,
    PollutionPointSerializer,
    RiskZoneSerializer,
    TrendPointSerializer,
)


class PublicHealthStatsView(APIView):
    """
    Statistiques agrégées pour le dashboard santé publique.
    Accessible aux rôles DOCTOR uniquement.
    """

    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        # Comptes d'utilisateurs par rôle
        total_patients = User.objects.filter(role=User.Role.PATIENT).count()
        total_doctors = User.objects.filter(role=User.Role.DOCTOR).count()

        # Alertes
        active_alerts = Alert.objects.filter(is_active=True).count()
        total_alerts = Alert.objects.all().count()

        # Prédictions récentes
        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        recent_predictions = Prediction.objects.filter(created_at__gte=last_7_days)
        total_predictions_7d = recent_predictions.count()
        high_risk_predictions_7d = recent_predictions.filter(
            Q(result__niveau_risque="Élevé") | Q(result__niveau_risque="Eleve")
        ).count()

        # Distribution vulnérabilité (profils santé)
        vulnerability_distribution = {
            "tres_eleve": HealthProfile.objects.filter(
                vulnerability_index__gte=70
            ).count(),
            "eleve": HealthProfile.objects.filter(
                vulnerability_index__gte=50, vulnerability_index__lt=70
            ).count(),
            "modere": HealthProfile.objects.filter(
                vulnerability_index__gte=30, vulnerability_index__lt=50
            ).count(),
            "faible": HealthProfile.objects.filter(
                vulnerability_index__gte=15, vulnerability_index__lt=30
            ).count(),
            "tres_faible": HealthProfile.objects.filter(
                vulnerability_index__lt=15
            ).count(),
        }

        data = {
            "population": {
                "patients": total_patients,
                "doctors": total_doctors,
            },
            "alerts": {
                "active": active_alerts,
                "total": total_alerts,
            },
            "predictions_last_7_days": {
                "total": total_predictions_7d,
                "high_risk": high_risk_predictions_7d,
            },
            "vulnerability_distribution": vulnerability_distribution,
        }
        return Response(data)


class RiskZonesView(APIView):
    """
    Liste des zones à risque (données agrégées).
    """

    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        zones = (
            RiskZone.objects.select_related("zone")
            .filter(is_active=True)
            .order_by("-risk_level", "-pollution_level")
        )
        serializer = RiskZoneSerializer(zones, many=True)
        return Response(serializer.data)


class ClustersView(APIView):
    """
    Détection simple de clusters : zones à risque élevé/critique.
    """

    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        clusters = (
            RiskZone.objects.select_related("zone")
            .filter(is_active=True, risk_level__in=["HIGH", "CRITICAL"])
            .order_by("-risk_level", "-high_risk_predictions_count")
        )
        serializer = RiskZoneSerializer(clusters, many=True)
        return Response(serializer.data)


class TrendsView(APIView):
    """
    Tendances sur les 14 derniers jours : prédictions et alertes.
    """

    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        now = timezone.now()
        start_date = (now - timedelta(days=14)).date()
        # Prépare un dictionnaire date -> counts
        trends = {}
        for i in range(15):
            day = start_date + timedelta(days=i)
            trends[day] = {"total": 0, "high_risk": 0, "alerts": 0}

        predictions = Prediction.objects.filter(created_at__date__gte=start_date)
        for pred in predictions:
            day = pred.created_at.date()
            if day in trends:
                trends[day]["total"] += 1
                if isinstance(pred.result, dict) and pred.result.get("niveau_risque") in (
                    "Élevé",
                    "Eleve",
                ):
                    trends[day]["high_risk"] += 1

        alerts = Alert.objects.filter(created_at__date__gte=start_date)
        for alert in alerts:
            day = alert.created_at.date()
            if day in trends:
                trends[day]["alerts"] += 1

        payload = [
            {"date": day, "total": values["total"], "high_risk": values["high_risk"], "alerts": values["alerts"]}
            for day, values in sorted(trends.items())
        ]
        serializer = TrendPointSerializer(payload, many=True)
        return Response(serializer.data)


class PollutionMapView(APIView):
    """
    Points pollution récents pour la carte (limités à 100 derniers).
    """

    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        points = EnvironmentData.objects.all().order_by("-timestamp")[:100]
        serializer = PollutionPointSerializer(points, many=True)
        return Response(serializer.data)


class HealthJournalView(APIView):
    """
    Carnet santé agrégé (patient ou médecin).
    - Patient : voit uniquement ses données
    - Médecin : peut cibler un patient via user_id, sinon toutes (limité par défaut)
    """

    permission_classes = [IsAuthenticated]

    def get_user_scope(self, request):
        user = request.user
        target_user_id = request.query_params.get("user_id")
        if user.is_doctor and target_user_id:
            try:
                return User.objects.get(id=target_user_id)
            except User.DoesNotExist:
                return None
        return user

    def get_date_filters(self, request, queryset, field_name):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        
        if date_from:
            try:
                # Convertir en datetime si nécessaire
                if isinstance(date_from, str):
                    date_from = timezone.datetime.fromisoformat(date_from.replace("Z", "+00:00"))
                queryset = queryset.filter(**{f"{field_name}__gte": date_from})
            except (ValueError, AttributeError):
                pass  # Ignorer les dates invalides
        
        if date_to:
            try:
                # Convertir en datetime si nécessaire  
                if isinstance(date_to, str):
                    date_to = timezone.datetime.fromisoformat(date_to.replace("Z", "+00:00"))
                queryset = queryset.filter(**{f"{field_name}__lte": date_to})
            except (ValueError, AttributeError):
                pass  # Ignorer les dates invalides
                
        return queryset

    def get(self, request):
        target_user = self.get_user_scope(request)
        if target_user is None:
            return Response({"detail": "Utilisateur cible introuvable."}, status=404)

        # Prédictions - FILTRER D'ABORD, PUIS LIMITER
        predictions_qs = Prediction.objects.filter(user=target_user).order_by("-created_at")
        predictions_qs = self.get_date_filters(request, predictions_qs, "created_at")
        predictions_qs = predictions_qs[:100]  # Slice À LA FIN
        predictions = PredictionEntrySerializer(predictions_qs, many=True).data

        # Mesures capteurs
        measurements_qs = SensorMeasurement.objects.filter(user=target_user).order_by("-created_at")
        measurements_qs = self.get_date_filters(request, measurements_qs, "created_at")
        measurements_qs = measurements_qs[:100]  # Slice À LA FIN
        measurements = MeasurementEntrySerializer(measurements_qs, many=True).data

        # Actions préventives
        actions_qs = PreventionAction.objects.filter(user=target_user).order_by("-created_at")
        actions_qs = self.get_date_filters(request, actions_qs, "created_at")
        actions_qs = actions_qs[:100]  # Slice À LA FIN
        actions = PreventionActionEntrySerializer(actions_qs, many=True).data

        # Alertes - FILTRER D'ABORD, PUIS LIMITER
        alerts_qs = Alert.objects.all().order_by("-created_at")
        alerts_qs = self.get_date_filters(request, alerts_qs, "created_at")
        alerts_qs = alerts_qs[:100]  # Slice À LA FIN
        alerts = AlertEntrySerializer(alerts_qs, many=True).data

        # Données environnementales - FILTRER D'ABORD, PUIS LIMITER
        env_qs = EnvironmentData.objects.all().order_by("-timestamp")
        env_qs = self.get_date_filters(request, env_qs, "timestamp")
        env_qs = env_qs[:100]  # Slice À LA FIN
        environment = EnvironmentEntrySerializer(env_qs, many=True).data

        return Response(
            {
                "user_id": target_user.pk,
                "predictions": predictions,
                "measurements": measurements,
                "prevention_actions": actions,
                "alerts": alerts,
                "environment": environment,
            }
        )

class HealthJournalSummaryView(APIView):
    """
    Résumé du carnet : compteurs simples par type.
    """

    permission_classes = [IsAuthenticated]

    def get_user_scope(self, request):
        user = request.user
        target_user_id = request.query_params.get("user_id")
        if user.is_doctor and target_user_id:
            try:
                return User.objects.get(id=target_user_id)
            except User.DoesNotExist:
                return None
        return user

    def get(self, request):
        target_user = self.get_user_scope(request)
        if target_user is None:
            return Response({"detail": "Utilisateur cible introuvable."}, status=404)

        preds_count = Prediction.objects.filter(user=target_user).count()
        meas_count = SensorMeasurement.objects.filter(user=target_user).count()
        actions_qs = PreventionAction.objects.filter(user=target_user)
        actions_count = actions_qs.count()
        actions_completed = actions_qs.filter(completed=True).count()

        alerts_count = Alert.objects.all().count()
        env_count = EnvironmentData.objects.all().count()

        return Response(
            {
                "user_id": target_user.pk,
                "predictions": preds_count,
                "measurements": meas_count,
                "actions": actions_count,
                "actions_completed": actions_completed,
                "alerts": alerts_count,
                "environment_entries": env_count,
            }
        )


class HealthJournalExportView(APIView):
    """
    Export JSON simple du carnet (mêmes filtres que HealthJournalView).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Réutiliser la logique de HealthJournalView
        hv = HealthJournalView()
        hv.request = request
        response = hv.get(request)
        if response.status_code != 200:
            return response
        data = response.data
        resp = Response(data)
        resp["Content-Disposition"] = 'attachment; filename="health_journal.json"'
        return resp


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def health_journal(self, request):
        """
        Carnet Santé Connecté - Journal agrégé
        GET /api/dashboard/health-journal/?date_from=2024-01-01&date_to=2024-12-31
        """
        try:
            user = request.user

            # Paramètres de filtrage
            date_from_str = request.query_params.get("date_from")
            date_to_str = request.query_params.get("date_to")

            # Défaut : 30 derniers jours
            date_from = timezone.now() - timedelta(days=30)
            date_to = timezone.now()

            # Conversion sécurisée des dates
            if date_from_str:
                try:
                    date_from = timezone.datetime.fromisoformat(
                        date_from_str.replace("Z", "+00:00")
                    )
                except (ValueError, AttributeError):
                    pass

            if date_to_str:
                try:
                    date_to = timezone.datetime.fromisoformat(
                        date_to_str.replace("Z", "+00:00")
                    )
                except (ValueError, AttributeError):
                    pass

            # Récupérer les données de l'utilisateur
            predictions = Prediction.objects.filter(
                user=user, created_at__gte=date_from, created_at__lte=date_to
            ).order_by("-created_at")

            measurements = SensorMeasurement.objects.filter(
                user=user, created_at__gte=date_from, created_at__lte=date_to
            ).order_by("-created_at")

            prevention_actions = PreventionAction.objects.filter(
                user=user, created_at__gte=date_from, created_at__lte=date_to
            ).order_by("-created_at")

            # Sérialiser les données
            from .serializers import (
                PredictionSerializer,
                SensorMeasurementSerializer,
                PreventionActionSerializer,
            )

            return Response(
                {
                    "predictions": PredictionSerializer(predictions, many=True).data,
                    "measurements": SensorMeasurementSerializer(measurements, many=True).data,
                    "prevention_actions": PreventionActionSerializer(prevention_actions, many=True).data,
                    "date_from": date_from.isoformat(),
                    "date_to": date_to.isoformat(),
                }
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
