"""
URLs pour l'app alerts.
"""
from django.urls import path
from .views import AlertViewSet
from .stream import alerts_stream

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
    path('alerts/', alert_list, name='alert-list'),
    path('alerts/<int:pk>/', alert_detail, name='alert-detail'),
    path('alerts/<int:pk>/deactivate/', AlertViewSet.as_view({'patch': 'deactivate'}), name='alert-deactivate'),
    path('alerts/active/', AlertViewSet.as_view({'get': 'active'}), name='alert-active'),
    path('alerts/active-count/', AlertViewSet.as_view({'get': 'active_count'}), name='alert-active-count'),
    path("stream/", alerts_stream),
]
