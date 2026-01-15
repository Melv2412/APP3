from datetime import timedelta

from django.conf import settings
from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response

from asiko_connect.apps.community.models import Zone
from asiko_connect.apps.alerts.models import Alert
from asiko_connect.utils.variables import ZONE_AQI_AVG_DAYS


class ZoneRiskRankingAPIView(APIView):
    """
    Classement des zones par AQI moyen (sur N jours)
    + nombre d'alertes de phase 3
    """

    def get(self, request):
        since = timezone.now() - timedelta(
            days=ZONE_AQI_AVG_DAYS
        )

        zones = (
            Zone.objects
            .annotate(
                avg_aqi=Avg(
                    "sensors__measurements__iqa",
                    filter=Q(
                        sensors__measurements__created_at__gte=since
                    )
                ),
                phase3_alerts=Count(
                    "sensors__measurements__alert",
                    filter=Q(
                        sensors__measurements__alert__phase=Alert.PHASE_3,
                        sensors__measurements__created_at__gte=since
                    ),
                    distinct=True
                )
            )
            .filter(avg_aqi__isnull=False)
            .order_by("-avg_aqi")
        )

        response = []
        for idx, zone in enumerate(zones, start=1):
            response.append({
                "rank": idx,
                "zone": zone.name,
                "avg_aqi": round(zone.avg_aqi, 2),
                "phase3_alerts": zone.phase3_alerts
            })

        return Response(response)






