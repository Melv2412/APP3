"""WSGI config placeholder for project structure."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asiko_connect.settings')

application = get_wsgi_application()
