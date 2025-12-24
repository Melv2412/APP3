"""
Views pour la gestion des profils de santé.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import HealthProfile, Comorbidity, VaccinationStatus
from .serializers import (
    HealthProfileSerializer,
    ComorbiditySerializer,
    VaccinationStatusSerializer,
    VulnerabilityIndexSerializer
)
from asiko_connect.apps.users.permissions import IsOwnerOrDoctor, IsDoctor


class HealthProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des profils de santé.
    
    Permissions :
    - Patients : peuvent voir et modifier uniquement leur propre profil
    - Médecins : peuvent voir tous les profils, modifier ceux de leurs patients
    """
    
    serializer_class = HealthProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrDoctor]
    
    def get_queryset(self):
        """Retourne les profils selon les permissions."""
        user = self.request.user
        
        if user.is_doctor:
            # Les médecins voient tous les profils
            return HealthProfile.objects.select_related('user').prefetch_related(
                'comorbidities',
                'vaccination_statuses'
            ).all()
        else:
            # Les patients voient uniquement leur propre profil
            return HealthProfile.objects.select_related('user').prefetch_related(
                'comorbidities',
                'vaccination_statuses'
            ).filter(user=user)
    
    def get_object(self):
        """Récupère un objet spécifique."""
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
    
    def perform_create(self, serializer):
        """Crée un nouveau profil de santé."""
        # S'assurer que le profil est lié à l'utilisateur connecté
        # (sauf si c'est un médecin qui crée pour un patient)
        user = self.request.user
        
        if user.is_patient:
            # Un patient ne peut créer que son propre profil
            serializer.save(user=user)
        elif user.is_doctor:
            # Un médecin peut créer un profil pour un patient
            # Le user_id doit être fourni dans les données
            user_id = self.request.data.get('user_id') or self.request.data.get('user')
            if user_id:
                from asiko_connect.apps.users.models import User
                patient = get_object_or_404(User, id=user_id, role=User.Role.PATIENT)
                serializer.save(user=patient)
            else:
                serializer.save(user=user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['get'], url_path='vulnerability-index')
    def vulnerability_index(self, request, pk=None):
        """
        Calcule et retourne l'indice de vulnérabilité d'un profil.
        GET /api/health-profiles/{id}/vulnerability-index/
        """
        profile = self.get_object()
        
        # Recalculer l'indice
        vulnerability_index = profile.calculate_vulnerability_index()
        
        # Préparer les facteurs explicatifs
        age = profile.calculate_age()
        comorbidity_count = profile.comorbidities.filter(is_active=True).count()
        vaccination_count = profile.vaccination_statuses.filter(is_vaccinated=True).count()
        
        factors = {
            'age': age,
            'age_score': self._calculate_age_score(age) if age else 0,
            'comorbidity_count': comorbidity_count,
            'comorbidity_score': min(comorbidity_count * 8, 30) if comorbidity_count > 0 else 0,
            'vaccination_count': vaccination_count,
            'smoking_status': profile.smoking_status,
            'alcohol_consumption': profile.alcohol_consumption,
        }
        
        serializer = VulnerabilityIndexSerializer({
            'vulnerability_index': vulnerability_index,
            'vulnerability_level': profile.get_vulnerability_level(),
            'last_calculated': profile.vulnerability_index_last_calculated,
            'factors': factors,
        })
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='recalculate-vulnerability')
    def recalculate_vulnerability(self, request, pk=None):
        """
        Force le recalcul de l'indice de vulnérabilité.
        POST /api/health-profiles/{id}/recalculate-vulnerability/
        """
        profile = self.get_object()
        vulnerability_index = profile.calculate_vulnerability_index()
        
        return Response({
            'vulnerability_index': vulnerability_index,
            'vulnerability_level': profile.get_vulnerability_level(),
            'message': 'Indice de vulnérabilité recalculé avec succès.',
        }, status=status.HTTP_200_OK)
    
    def _calculate_age_score(self, age):
        """Calcule le score basé sur l'âge (méthode interne)."""
        if age >= 75:
            return 30
        elif age >= 65:
            return 25
        elif age >= 55:
            return 15
        elif age >= 45:
            return 10
        elif age >= 35:
            return 5
        return 0


class ComorbidityViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des comorbidités.
    Accessible aux médecins et aux patients (pour consultation).
    """
    
    serializer_class = ComorbiditySerializer
    permission_classes = [IsAuthenticated]
    queryset = Comorbidity.objects.all()
    
    def get_queryset(self):
        """Retourne les comorbidités."""
        queryset = Comorbidity.objects.all()
        
        # Filtrer par statut actif si demandé
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


class VaccinationStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des statuts vaccinaux.
    Accessible aux médecins et aux patients (pour consultation).
    """
    
    serializer_class = VaccinationStatusSerializer
    permission_classes = [IsAuthenticated]
    queryset = VaccinationStatus.objects.all()
    
    def get_queryset(self):
        """Retourne les statuts vaccinaux."""
        queryset = VaccinationStatus.objects.all()
        
        # Filtrer par type de vaccin si demandé
        vaccine_type = self.request.query_params.get('vaccine_type', None)
        if vaccine_type:
            queryset = queryset.filter(vaccine_type=vaccine_type)
        
        # Filtrer par statut vacciné si demandé
        is_vaccinated = self.request.query_params.get('is_vaccinated', None)
        if is_vaccinated is not None:
            queryset = queryset.filter(is_vaccinated=is_vaccinated.lower() == 'true')
        
        return queryset
