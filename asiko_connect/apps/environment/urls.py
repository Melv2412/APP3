"""
URLs pour l'app environment.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnvironmentDataViewSet

router = DefaultRouter()
router.register(r'environment', EnvironmentDataViewSet, basename='environment')

urlpatterns = [
    path('', include(router.urls)),
]
