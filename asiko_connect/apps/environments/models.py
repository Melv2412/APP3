from django.db import models
from asiko_connect.apps.alerts.models import Alert

class Environment(models.Model):
    name = models.CharField(max_length=100)
    location_lat = models.FloatField()
    location_lon = models.FloatField()
    alert_count = models.IntegerField(default=0)
    avg_pollution = models.FloatField(default=0)

    def update_stats(self):
        alerts = Alert.objects.filter(
            location_lat=self.location_lat,
            location_lon=self.location_lon
        )

        self.alert_count = alerts.count()
        self.avg_pollution = alerts.aggregate(
            models.Avg("pollution_index")
        )["pollution_index__avg"] or 0

        self.save()
