"""
Fichier de settings principal pour ASIKO Connect.
Importe la configuration selon l'environnement (development par défaut).
"""
import os
from decouple import config

# Déterminer l'environnement (development par défaut)
ENVIRONMENT = config('ENVIRONMENT', default='development')

if ENVIRONMENT == 'production':
    from asiko_connect.core.settings.production import *
else:
    from asiko_connect.core.settings.development import *
