# project/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "asiko_connect.settings")

app = Celery("asiko_connect")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
