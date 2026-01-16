"""
URLs pour l'app alerts.
"""
from django.urls import path
from .views import AlertViewSet

# URLs pour Alert (sans router pour éviter conflit format_suffix_patterns)
alert_list = AlertViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

alert_detail = AlertViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('', alert_list, name='alert-list'),
    path('<int:pk>/', alert_detail, name='alert-detail'),
    path('<int:pk>/deactivate/', AlertViewSet.as_view({'patch': 'deactivate'}), name='alert-deactivate'),
    path('active/', AlertViewSet.as_view({'get': 'active'}), name='alert-active'),
    path('active-count/', AlertViewSet.as_view({'get': 'active_count'}), name='alert-active-count'),
]
