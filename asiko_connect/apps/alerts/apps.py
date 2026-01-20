from django.apps import AppConfig


class AlertsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'asiko_connect.apps.alerts'

    def ready(self):
        """
        Enregistre les signaux Django quand l'app est prête.
        """
        import asiko_connect.apps.alerts.signals  # noqa