#!/usr/bin/env python
"""
Script de démo pour créer une zone à risque
Simule l'envoi de données depuis un capteur IoT avec position GPS

Usage:
    python scripts/create_risk_zone_demo.py

Prérequis:
    1. Créer une Zone dans l'admin Django (ex: "Salle de Présentation")
    2. Créer un Sensor avec device_id="DEMO_SENSOR_001" lié à cette Zone
    3. Le serveur Django doit être en cours d'exécution
"""

import requests
import json
import sys
import os

# Configuration
API_BASE = "http://localhost:8000/api"
DEVICE_ID = "DEMO_SENSOR_001"

# Coordonnées par défaut (Abidjan) - peut être modifié
DEFAULT_LATITUDE = 5.316667
DEFAULT_LONGITUDE = -4.033333

# Valeurs de pollution élevées pour déclencher une alerte
POLLUTION_DATA = {
    "device_id": DEVICE_ID,
    "pm25": 150,      # Très élevé (seuil critique ~50)
    "pm10": 200,      # Très élevé
    "o3": 180,        # Élevé
    "no2": 120,       # Élevé
    "so2": 100,       # Élevé
    "co": 15,         # Élevé
    "humidity": 60,
    "temperature": 28,
    "latitude": DEFAULT_LATITUDE,
    "longitude": DEFAULT_LONGITUDE
}


def create_risk_zone(latitude=None, longitude=None):
    """
    Envoie des données de pollution élevées pour créer une zone à risque.
    
    Args:
        latitude: Latitude GPS (optionnel, utilise DEFAULT_LATITUDE si None)
        longitude: Longitude GPS (optionnel, utilise DEFAULT_LONGITUDE si None)
    """
    data = POLLUTION_DATA.copy()
    
    if latitude is not None:
        data["latitude"] = latitude
    if longitude is not None:
        data["longitude"] = longitude
    
    print(f"📡 Envoi de données capteur...")
    print(f"   Device ID: {data['device_id']}")
    print(f"   Position: ({data['latitude']}, {data['longitude']})")
    print(f"   PM2.5: {data['pm25']} (très élevé)")
    print(f"   PM10: {data['pm10']} (très élevé)")
    
    try:
        response = requests.post(
            f"{API_BASE}/sensors/data/",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            print(f"✅ Zone à risque créée avec succès!")
            print(f"   La zone a été mise à jour avec la position GPS")
            print(f"   Une alerte devrait être déclenchée si les seuils sont dépassés")
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Erreur de connexion: Le serveur Django n'est pas accessible à {API_BASE}")
        print(f"   Assurez-vous que le serveur est en cours d'exécution: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return False


def main():
    """Fonction principale"""
    print("=" * 60)
    print("🚀 Script de Démo - Création Zone à Risque")
    print("=" * 60)
    print()
    
    # Vérifier les arguments en ligne de commande
    latitude = None
    longitude = None
    
    if len(sys.argv) >= 3:
        try:
            latitude = float(sys.argv[1])
            longitude = float(sys.argv[2])
            print(f"📍 Position GPS fournie: ({latitude}, {longitude})")
        except ValueError:
            print("⚠️  Arguments invalides. Utilisation des coordonnées par défaut.")
    else:
        print(f"📍 Utilisation des coordonnées par défaut: ({DEFAULT_LATITUDE}, {DEFAULT_LONGITUDE})")
        print(f"   Pour spécifier une position: python {sys.argv[0]} <latitude> <longitude>")
    
    print()
    
    # Envoyer les données
    success = create_risk_zone(latitude, longitude)
    
    print()
    if success:
        print("=" * 60)
        print("✅ Démo terminée avec succès!")
        print("=" * 60)
        print()
        print("💡 Prochaines étapes:")
        print("   1. Vérifiez dans l'admin Django que la Zone a été mise à jour")
        print("   2. Vérifiez qu'une Alerte a été créée (si seuils dépassés)")
        print("   3. Vérifiez dans l'app frontend que la zone apparaît sur la carte")
    else:
        print("=" * 60)
        print("❌ Démo échouée")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
