"""
URLs pour l'application health_profiles.
"""
from django.urls import path
from .views import (
    HealthProfileViewSet,
    ComorbidityViewSet,
    VaccinationStatusViewSet
)

# URLs pour HealthProfile
health_profile_list = HealthProfileViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

health_profile_detail = HealthProfileViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# URLs pour Comorbidity
comorbidity_list = ComorbidityViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

comorbidity_detail = ComorbidityViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# URLs pour VaccinationStatus
vaccination_status_list = VaccinationStatusViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

vaccination_status_detail = VaccinationStatusViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    # Health Profiles
    path('health-profiles/', health_profile_list, name='health-profile-list'),
    path('health-profiles/<int:pk>/', health_profile_detail, name='health-profile-detail'),
    path('health-profiles/<int:pk>/vulnerability-index/', 
         HealthProfileViewSet.as_view({'get': 'vulnerability_index'}), 
         name='health-profile-vulnerability-index'),
    path('health-profiles/<int:pk>/recalculate-vulnerability/', 
         HealthProfileViewSet.as_view({'post': 'recalculate_vulnerability'}), 
         name='health-profile-recalculate-vulnerability'),
    
    # Comorbidities
    path('comorbidities/', comorbidity_list, name='comorbidity-list'),
    path('comorbidities/<int:pk>/', comorbidity_detail, name='comorbidity-detail'),
    
    # Vaccination Statuses
    path('vaccination-statuses/', vaccination_status_list, name='vaccination-status-list'),
    path('vaccination-statuses/<int:pk>/', vaccination_status_detail, name='vaccination-status-detail'),
]
