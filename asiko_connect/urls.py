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
    path('api/', include('asiko_connect.apps.community.urls')),
    path('api/', include('asiko_connect.apps.health_profiles.urls')),
    path('api/sensors/', include('asiko_connect.apps.sensors.urls')),    # Les autres apps seront ajoutées ici au fur et à mesure
]

# Servir les fichiers médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
