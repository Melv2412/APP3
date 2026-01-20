import os
from celery import Celery
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "asiko_connect.settings")

app = Celery("asiko_connect")

# Setup Django
django.setup()

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')