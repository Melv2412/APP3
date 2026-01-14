"""
URLs pour l'app environment.
"""
from django.urls import path
from .views import EnvironmentDataViewSet

# URLs pour EnvironmentData (sans router pour éviter conflit format_suffix_patterns)
environment_list = EnvironmentDataViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

environment_detail = EnvironmentDataViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('environment/', environment_list, name='environment-list'),
    path('environment/<int:pk>/', environment_detail, name='environment-detail'),
    path('environment/nearby/', EnvironmentDataViewSet.as_view({'get': 'nearby'}), name='environment-nearby'),
    path('environment/current/<str:lat>/<str:lng>/', EnvironmentDataViewSet.as_view({'get': 'current'}), name='environment-current'),
]
