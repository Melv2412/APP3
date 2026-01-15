"""
Services pour le calcul des zones à risque.
"""
from django.utils import timezone
from django.db.models import Avg, Count, Q
from datetime import timedelta
from math import radians, cos, sin, asin, sqrt

from asiko_connect.apps.sensors.models import Zone, Sensor, AirQualityMeasurement, SensorMeasurement, Prediction
from .models import RiskZone


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calcule la distance entre deux points GPS en mètres.
    Utilise la formule de Haversine.
    """
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')
    
    # Convertir en radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Formule de Haversine
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Rayon de la Terre en mètres
    r = 6371000
    
    return c * r


def aggregate_environmental_data(zone):
    """
    Agrège les données environnementales pour une zone.
    
    Retourne :
    - pollution_level (moyenne IQA sur les dernières 24h)
    - measurement_count (nombre de mesures)
    """
    if not zone.latitude or not zone.longitude:
        return {
            'pollution_level': 0.0,
            'measurement_count': 0
        }
    
    # Récupérer les capteurs de cette zone
    sensors = Sensor.objects.filter(zone=zone)
    
    if not sensors.exists():
        return {
            'pollution_level': 0.0,
            'measurement_count': 0
        }
    
    # Récupérer les mesures des dernières 24h
    last_24h = timezone.now() - timedelta(hours=24)
    measurements = AirQualityMeasurement.objects.filter(
        sensor__in=sensors,
        created_at__gte=last_24h
    )
    
    if not measurements.exists():
        return {
            'pollution_level': 0.0,
            'measurement_count': 0
        }
    
    # Calculer la moyenne de l'IQA
    avg_iqa = measurements.aggregate(Avg('iqa'))['iqa__avg'] or 0.0
    
    return {
        'pollution_level': round(avg_iqa, 2),
        'measurement_count': measurements.count()
    }


def aggregate_respiratory_signals(zone, radius_meters=1000):
    """
    Agrège les signaux respiratoires (SensorMeasurement et Prediction) 
    dans un rayon autour de la zone.
    
    Retourne :
    - respiratory_signal_count (nombre de mesures récentes)
    - high_risk_predictions_count (nombre de prédictions à risque élevé)
    """
    if not zone.latitude or not zone.longitude:
        return {
            'respiratory_signal_count': 0,
            'high_risk_predictions_count': 0
        }
    
    # Récupérer les mesures des dernières 24h
    last_24h = timezone.now() - timedelta(hours=24)
    
    # Pour les SensorMeasurement, on ne peut pas filtrer par GPS directement
    # car SensorMeasurement n'a pas de position GPS (c'est lié à un user)
    # On va compter toutes les mesures récentes pour l'instant
    # (Dans une vraie implémentation, on pourrait utiliser la position du user)
    measurements = SensorMeasurement.objects.filter(
        created_at__gte=last_24h
    )
    
    # Pour les prédictions à risque élevé
    predictions = Prediction.objects.filter(
        created_at__gte=last_24h,
        result__niveau_risque__in=['Élevé', 'HIGH', 'HIGH_RISK']
    )
    
    return {
        'respiratory_signal_count': measurements.count(),
        'high_risk_predictions_count': predictions.count()
    }


def calculate_zone_risk_level(zone, pollution_level, respiratory_signal_count, high_risk_predictions_count):
    """
    Calcule le niveau de risque d'une zone basé sur :
    - Niveau de pollution (IQA)
    - Nombre de signaux respiratoires
    - Nombre de prédictions à risque élevé
    
    Retourne : 'LOW', 'MODERATE', 'HIGH', ou 'CRITICAL'
    """
    risk_score = 0
    
    # Score basé sur la pollution (0-50 points)
    if pollution_level >= 200:  # Très mauvais
        risk_score += 50
    elif pollution_level >= 150:  # Mauvais
        risk_score += 35
    elif pollution_level >= 100:  # Modéré
        risk_score += 20
    elif pollution_level >= 50:  # Acceptable
        risk_score += 10
    
    # Score basé sur les signaux respiratoires (0-30 points)
    if respiratory_signal_count >= 50:
        risk_score += 30
    elif respiratory_signal_count >= 20:
        risk_score += 20
    elif respiratory_signal_count >= 10:
        risk_score += 10
    elif respiratory_signal_count >= 5:
        risk_score += 5
    
    # Score basé sur les prédictions à risque élevé (0-20 points)
    if high_risk_predictions_count >= 10:
        risk_score += 20
    elif high_risk_predictions_count >= 5:
        risk_score += 15
    elif high_risk_predictions_count >= 3:
        risk_score += 10
    elif high_risk_predictions_count >= 1:
        risk_score += 5
    
    # Déterminer le niveau de risque
    if risk_score >= 70:
        return RiskZone.RiskLevel.CRITICAL
    elif risk_score >= 50:
        return RiskZone.RiskLevel.HIGH
    elif risk_score >= 30:
        return RiskZone.RiskLevel.MODERATE
    else:
        return RiskZone.RiskLevel.LOW


def update_risk_zones():
    """
    Met à jour toutes les zones à risque actives.
    Cette fonction peut être appelée par une tâche Celery périodique.
    """
    zones = Zone.objects.filter(
        latitude__isnull=False,
        longitude__isnull=False
    )
    
    updated_count = 0
    
    for zone in zones:
        # Agrégation des données environnementales
        env_data = aggregate_environmental_data(zone)
        
        # Agrégation des signaux respiratoires
        resp_data = aggregate_respiratory_signals(zone)
        
        # Calcul du niveau de risque
        risk_level = calculate_zone_risk_level(
            zone,
            env_data['pollution_level'],
            resp_data['respiratory_signal_count'],
            resp_data['high_risk_predictions_count']
        )
        
        # Créer ou mettre à jour la RiskZone
        risk_zone, created = RiskZone.objects.get_or_create(
            zone=zone,
            defaults={
                'risk_level': risk_level,
                'pollution_level': env_data['pollution_level'],
                'respiratory_signal_count': resp_data['respiratory_signal_count'],
                'high_risk_predictions_count': resp_data['high_risk_predictions_count'],
                'is_active': True,
            }
        )
        
        if not created:
            # Mise à jour
            risk_zone.risk_level = risk_level
            risk_zone.pollution_level = env_data['pollution_level']
            risk_zone.respiratory_signal_count = resp_data['respiratory_signal_count']
            risk_zone.high_risk_predictions_count = resp_data['high_risk_predictions_count']
            risk_zone.last_updated = timezone.now()
            risk_zone.save()
        
        updated_count += 1
    
    return updated_count


def get_nearby_risk_zones(latitude, longitude, radius_meters=5000):
    """
    Retourne les zones à risque proches d'un point GPS.
    
    Args:
        latitude: Latitude du point
        longitude: Longitude du point
        radius_meters: Rayon de recherche en mètres (défaut: 5km)
    
    Returns:
        QuerySet de RiskZone
    """
    if not latitude or not longitude:
        return RiskZone.objects.none()
    
    # Récupérer toutes les zones actives avec GPS
    risk_zones = RiskZone.objects.filter(
        is_active=True,
        zone__latitude__isnull=False,
        zone__longitude__isnull=False
    ).select_related('zone')
    
    # Filtrer par distance (calcul Haversine)
    nearby_zones = []
    for risk_zone in risk_zones:
        distance = haversine_distance(
            latitude, longitude,
            risk_zone.zone.latitude, risk_zone.zone.longitude
        )
        if distance <= radius_meters:
            nearby_zones.append(risk_zone.id)
    
    return RiskZone.objects.filter(id__in=nearby_zones)
