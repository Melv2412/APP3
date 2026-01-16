"""
URLs principales pour ASIKO Connect.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('asiko_connect.apps.users.urls')),
    path('api/', include('asiko_connect.apps.health_profiles.urls')),
    path('api/sensors/', include('asiko_connect.apps.sensors.urls')),
    path('api/', include('asiko_connect.apps.environment.urls')),  # Phase 4 : Environment
    path('api/alerts/', include('asiko_connect.apps.alerts.urls')),  # Phase 5 : Alertes
    path('api/treatments/', include('asiko_connect.apps.treatments.urls')),  # Phase 7 : Actions Préventives
    path('api/community/', include('asiko_connect.apps.community.urls')),  # Phase 6 : Zones à Risque
    path('api/dashboard/', include('asiko_connect.apps.dashboard.urls')),  # Phase 8 : Dashboard Santé Publique
    path('api/telemedicine/', include('asiko_connect.apps.telemedicine.urls')),  # Chat Médecin-Patient
]

# Servir les fichiers médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
