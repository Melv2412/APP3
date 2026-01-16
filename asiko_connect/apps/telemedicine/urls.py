from django.urls import path
from .views import ThreadViewSet, DoctorViewSet

thread_list = ThreadViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

thread_detail = ThreadViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('threads/', thread_list, name='thread-list'),
    path('threads/<int:pk>/', thread_detail, name='thread-detail'),
    path('threads/<int:pk>/send_message/', ThreadViewSet.as_view({'post': 'send_message'}), name='thread-send-message'),
    path('threads/<int:pk>/messages/', ThreadViewSet.as_view({'get': 'messages'}), name='thread-messages'),
    path('threads/<int:pk>/toggle_journal/', ThreadViewSet.as_view({'post': 'toggle_journal'}), name='thread-toggle-journal'),
    path('doctors/', DoctorViewSet.as_view({'get': 'list'}), name='doctor-list'),
]
