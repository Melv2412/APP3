"""
Client pour communiquer avec le microservice IA externe (FastAPI).
"""
import requests
import logging
from django.conf import settings
from .exceptions import AIMicroserviceError, InsufficientDataError

logger = logging.getLogger(__name__)


def call_ai_microservice(audio_file=None, sensor_data=None, env_data=None, health_profile=None):
    """
    Appelle le microservice IA pour obtenir une prédiction de pneumonie.
    
    Args:
        audio_file: Fichier audio de toux (File object ou path)
        sensor_data: Dict contenant les données des capteurs IoT
        env_data: Dict contenant les données environnementales
        health_profile: Dict contenant le profil de santé de l'utilisateur
    
    Returns:
        Dict contenant:
            - probability: float (0-1)
            - confidence_interval_lower: float
            - confidence_interval_upper: float
            - factors: dict (facteurs explicatifs)
            - prediction_window_days: int (3-7)
    
    Raises:
        AIMicroserviceError: Si le microservice est indisponible
        InsufficientDataError: Si les données sont insuffisantes
    """
    url = f"{settings.AI_MICROSERVICE_URL}/api/predict"
    
    # Préparer les données
    payload = {}
    files = {}
    
    if audio_file:
        files['audio'] = audio_file
    
    if sensor_data:
        payload['sensor_data'] = sensor_data
    
    if env_data:
        payload['environment_data'] = env_data
    
    if health_profile:
        payload['health_profile'] = health_profile
    
    # Vérifier qu'on a au moins quelques données
    if not any([audio_file, sensor_data, env_data]):
        raise InsufficientDataError("Au moins une source de données est requise (audio, capteurs, ou environnement).")
    
    try:
        logger.info(f"Appel du microservice IA à {url}")
        
        response = requests.post(
            url,
            data=payload,
            files=files,
            timeout=settings.AI_MICROSERVICE_TIMEOUT
        )
        
        response.raise_for_status()
        
        result = response.json()
        
        logger.info(f"Réponse du microservice IA: {result}")
        
        return {
            'probability': result.get('probability', 0.0),
            'confidence_interval_lower': result.get('confidence_interval_lower', 0.0),
            'confidence_interval_upper': result.get('confidence_interval_upper', 1.0),
            'factors': result.get('factors', {}),
            'prediction_window_days': result.get('prediction_window_days', 7),
        }
    
    except requests.exceptions.Timeout:
        logger.error(f"Timeout lors de l'appel au microservice IA ({settings.AI_MICROSERVICE_TIMEOUT}s)")
        raise AIMicroserviceError("Le service de prédiction IA a pris trop de temps à répondre.")
    
    except requests.exceptions.ConnectionError:
        logger.error("Impossible de se connecter au microservice IA")
        raise AIMicroserviceError("Impossible de se connecter au service de prédiction IA.")
    
    except requests.exceptions.HTTPError as e:
        logger.error(f"Erreur HTTP du microservice IA: {e}")
        raise AIMicroserviceError(f"Erreur du service de prédiction IA: {e}")
    
    except Exception as e:
        logger.error(f"Erreur inattendue lors de l'appel au microservice IA: {e}")
        raise AIMicroserviceError("Une erreur inattendue s'est produite avec le service de prédiction IA.")

