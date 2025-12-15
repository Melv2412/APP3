"""
Fichier de settings minimal pour l'arborescence (placeholder).
Ne pas utiliser en production — sert uniquement à structurer le projet.
"""
SECRET_KEY = 'replace-me'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Apps du projet (structure uniquement)
    'asiko_connect.apps.users',
    'asiko_connect.apps.health_profiles',
    'asiko_connect.apps.sensors',
    'asiko_connect.apps.environment',
    'asiko_connect.apps.predictions',
    'asiko_connect.apps.alerts',
    'asiko_connect.apps.telemedicine',
    'asiko_connect.apps.treatments',
    'asiko_connect.apps.dashboard',
    'asiko_connect.apps.community',
]

ROOT_URLCONF = 'asiko_connect.urls'

# Minimal static settings for structure
STATIC_URL = '/static/'
