from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Thread, Message
from .serializers import ThreadSerializer, ThreadCreateSerializer, MessageSerializer, UserSimpleSerializer

User = get_user_model()

class IsThreadParticipant(permissions.BasePermission):
    """
    Permission pour s'assurer que l'utilisateur est soit le patient, soit le médecin du thread.
    """
    def has_object_permission(self, request, view, obj):
        return request.user == obj.patient or request.user == obj.doctor

class ThreadViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les threads de discussion.
    """
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated, IsThreadParticipant]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.PATIENT:
            return Thread.objects.filter(patient=user)
        elif user.role == User.Role.DOCTOR:
            return Thread.objects.filter(doctor=user)
        return Thread.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return ThreadCreateSerializer
        return ThreadSerializer

    def perform_create(self, serializer):
        # Un patient crée un thread avec un médecin
        serializer.save(patient=self.request.user)

    def create(self, request, *args, **kwargs):
        # Utiliser ThreadCreateSerializer pour la validation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Retourner avec ThreadSerializer pour avoir les détails complets
        thread = serializer.instance
        response_serializer = ThreadSerializer(thread, context={'request': request})
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        thread = self.get_object()
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Le contenu est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        
        message = Message.objects.create(
            thread=thread,
            sender=request.user,
            content=content
        )
        # Mettre à jour le timestamp du thread pour le tri
        thread.save() # Trigger auto_now updated_at
        
        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        thread = self.get_object()
        messages = thread.messages.all()
        
        # Marquer comme lu les messages reçus
        messages.exclude(sender=request.user).update(is_read=True)
        
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_journal(self, request, pk=None):
        thread = self.get_object()
        if request.user != thread.patient:
            return Response(
                {'error': "Seul le patient peut autoriser le partage de son carnet."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        thread.is_journal_shared = not thread.is_journal_shared
        thread.save()
        
        return Response({
            'is_journal_shared': thread.is_journal_shared,
            'message': f"Partage du carnet {'activé' if thread.is_journal_shared else 'désactivé'}."
        })

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour lister les médecins disponibles pour les patients.
    """
    queryset = User.objects.filter(role=User.Role.DOCTOR)
    serializer_class = UserSimpleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'username']
