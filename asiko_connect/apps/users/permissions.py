"""
Permissions personnalisées pour ASIKO Connect.
"""
from rest_framework import permissions


class IsDoctor(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un médecin.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_doctor
        )


class IsPatient(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un patient.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_patient
        )


class IsOwnerOrDoctor(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est le propriétaire de la ressource
    ou un médecin.
    """
    
    def has_object_permission(self, request, view, obj):
        # Les médecins peuvent accéder à toutes les ressources
        if request.user.is_doctor:
            return True
        
        # Les patients ne peuvent accéder qu'à leurs propres ressources
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Si l'objet est un User, vérifier directement
        if isinstance(obj, type(request.user)):
            return obj == request.user
        
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission pour permettre la lecture à tous les utilisateurs authentifiés
    et l'écriture uniquement au propriétaire.
    """
    
    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Écriture uniquement pour le propriétaire
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False

