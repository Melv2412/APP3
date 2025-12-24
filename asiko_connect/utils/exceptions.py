"""
Exceptions personnalisées pour ASIKO Connect.
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class AIMicroserviceError(APIException):
    """Exception levée lors d'une erreur avec le microservice IA."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Le service de prédiction IA est temporairement indisponible.'
    default_code = 'ai_service_unavailable'


class DataValidationError(APIException):
    """Exception levée lors d'une erreur de validation des données."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Les données fournies sont invalides.'
    default_code = 'data_validation_error'


class InsufficientDataError(APIException):
    """Exception levée lorsqu'il n'y a pas assez de données pour effectuer une opération."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Données insuffisantes pour effectuer cette opération.'
    default_code = 'insufficient_data'


class PermissionDeniedError(APIException):
    """Exception levée lors d'un refus d'accès."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Vous n\'avez pas la permission d\'effectuer cette action.'
    default_code = 'permission_denied'

