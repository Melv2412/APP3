"""
URLs pour l'app treatments (Actions Préventives).
"""
from django.urls import path
from .views import PreventionActionViewSet

# URLs pour PreventionAction (sans router pour éviter conflit format_suffix_patterns)
prevention_action_list = PreventionActionViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

prevention_action_detail = PreventionActionViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('prevention-actions/', prevention_action_list, name='prevention-action-list'),
    path('prevention-actions/<int:pk>/', prevention_action_detail, name='prevention-action-detail'),
    path('prevention-actions/<int:pk>/complete/', 
         PreventionActionViewSet.as_view({'post': 'complete'}), 
         name='prevention-action-complete'),
    path('prevention-actions/pending/', 
         PreventionActionViewSet.as_view({'get': 'pending'}), 
         name='prevention-action-pending'),
    path('prevention-actions/priority/', 
         PreventionActionViewSet.as_view({'get': 'priority'}), 
         name='prevention-action-priority'),
    path('prevention-actions/generate/', 
         PreventionActionViewSet.as_view({'post': 'generate'}), 
         name='prevention-action-generate'),
]
