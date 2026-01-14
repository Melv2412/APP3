"""
Views pour l'app treatments (Actions Préventives).
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.utils import timezone

from .models import PreventionAction
from .serializers import PreventionActionSerializer
from .services import suggest_actions_based_on_risk


class PreventionActionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des actions préventives.
    
    Permissions :
    - Les utilisateurs authentifiés peuvent voir leurs propres actions
    - Les médecins peuvent voir toutes les actions
    """
    serializer_class = PreventionActionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['action_type', 'priority', 'completed', 'alert']
    ordering_fields = ['created_at', 'priority', 'completed_at']
    ordering = ['-priority', '-created_at']
    search_fields = ['recommendation_text']
    
    def get_queryset(self):
        """Retourne les actions selon les permissions."""
        user = self.request.user
        
        # Les médecins voient toutes les actions
        if user.is_doctor or user.is_admin:
            queryset = PreventionAction.objects.select_related('user', 'alert', 'alert__sensor', 'alert__sensor__zone').all()
        else:
            # Les patients voient uniquement leurs propres actions
            queryset = PreventionAction.objects.select_related('user', 'alert', 'alert__sensor', 'alert__sensor__zone').filter(
                user=user
            )
        
        # Filtres supplémentaires
        completed = self.request.query_params.get('completed')
        priority = self.request.query_params.get('priority')
        action_type = self.request.query_params.get('action_type')
        
        if completed is not None:
            completed_bool = completed.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(completed=completed_bool)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        
        return queryset
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        """
        Marque une action comme complétée.
        POST /api/treatments/prevention-actions/{id}/complete/
        """
        action = self.get_object()
        
        # Vérifier que l'utilisateur peut compléter cette action
        if not (request.user.is_doctor or request.user.is_admin or action.user == request.user):
            return Response(
                {'error': 'Vous n\'avez pas la permission de compléter cette action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if action.completed:
            return Response(
                {'message': 'Cette action est déjà complétée.'},
                status=status.HTTP_200_OK
            )
        
        action.mark_as_completed()
        
        serializer = self.get_serializer(action)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request):
        """
        Retourne les actions non complétées.
        GET /api/treatments/prevention-actions/pending/
        """
        pending_actions = self.get_queryset().filter(completed=False)
        serializer = self.get_serializer(pending_actions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='priority')
    def priority(self, request):
        """
        Retourne les actions prioritaires non complétées.
        GET /api/treatments/prevention-actions/priority/
        """
        priority_actions = self.get_queryset().filter(
            completed=False,
            priority=PreventionAction.HIGH
        )
        serializer = self.get_serializer(priority_actions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        Génère des actions préventives pour l'utilisateur connecté
        basées sur ses prédictions, alertes et zones à risque.
        POST /api/treatments/prevention-actions/generate/
        """
        user = request.user
        
        # Générer les actions
        actions_created = suggest_actions_based_on_risk(user)
        
        serializer = self.get_serializer(actions_created, many=True)
        return Response({
            'message': f'{len(actions_created)} action(s) générée(s).',
            'actions': serializer.data
        }, status=status.HTTP_201_CREATED)
