"""
Views pour la gestion des alertes.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Alert
from .serializers import AlertSerializer


class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des alertes.
    
    Permissions :
    - Tous les utilisateurs authentifiés peuvent voir les alertes
    - Les médecins peuvent voir toutes les alertes
    """
    queryset = Alert.objects.select_related('sensor').all()
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['sensor', 'phase', 'is_active']
    ordering_fields = ['created_at', 'phase_1_started_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Retourne les alertes selon les permissions."""
        queryset = Alert.objects.select_related('sensor').all()
        
        # Filtres supplémentaires
        phase = self.request.query_params.get('phase')
        is_active = self.request.query_params.get('is_active')
        
        if phase:
            queryset = queryset.filter(phase=phase)
        
        if is_active is not None:
            is_active_bool = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active_bool)
        
        # Les médecins voient toutes les alertes
        # Les autres utilisateurs voient aussi toutes les alertes (pour l'instant)
        # TODO: Si nécessaire, filtrer par sensor.zone ou autre critère
        return queryset
    
    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        """
        Désactive une alerte.
        PATCH /api/alerts/{id}/deactivate/
        """
        alert = self.get_object()
        alert.is_active = False
        alert.save(update_fields=['is_active'])
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        """
        Retourne les alertes actives.
        GET /api/alerts/active/
        """
        active_alerts = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='active-count')
    def active_count(self, request):
        """
        Retourne le nombre d'alertes actives.
        GET /api/alerts/active-count/
        """
        count = self.get_queryset().filter(is_active=True).count()
        return Response({'count': count})
