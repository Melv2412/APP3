from django.utils import timezone
from django.db.models import Avg

from asiko_connect.apps.sensors.models import AirQualityMeasurement

def compute_average_iqa(sensor, start_time, duration_seconds, alert=None):
    """
    Calcule la moyenne de l'IQA pour un capteur
    sur une fenêtre de temps précise.
    Si alert est donné, filtre uniquement les mesures de cette alerte.
    """

    end_time = start_time + timezone.timedelta(seconds=duration_seconds)

    filters = {
        "sensor": sensor,
        "created_at__gte": start_time,
        "created_at__lte": end_time,
    }

    if alert:
        filters["alert"] = alert

    measurements = AirQualityMeasurement.objects.filter(**filters)
    count = measurements.count()
    print(f"[DEBUG] Mesures trouvées pour {sensor} (alerte={alert}): {count}")

    if count == 0:
        return None

    avg_iqa = measurements.aggregate(avg=Avg("iqa"))["avg"]
    print(f"[DEBUG] Moyenne IQA: {avg_iqa}")

    return round(avg_iqa, 2) if avg_iqa is not None else None
