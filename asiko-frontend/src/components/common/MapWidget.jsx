/**
 * Composant MapWidget
 * Widget carte interactive pour le Dashboard
 */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getCurrentEnvironmentData } from '../../services/environment';
import { Link } from 'react-router-dom';

const MapWidget = ({ latitude, longitude, height = 'h-48' }) => {
  const [environmentData, setEnvironmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState({ 
    lat: latitude || 5.3600, 
    lng: longitude || -4.0083 
  });

  // Récupérer la position GPS de l'utilisateur
  useEffect(() => {
    let watchId = null;
    
    if (navigator.geolocation && !latitude && !longitude) {
      // Si latitude/longitude ne sont pas fournies, récupérer la position GPS
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      };
      
      const onSuccess = (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('📍 MapWidget - Position GPS:', newPosition);
        setUserPosition(newPosition);
      };
      
      const onError = (err) => {
        console.error('❌ MapWidget - Erreur géolocalisation:', err);
        // Utiliser position par défaut (Abidjan)
      };
      
      // Obtenir la position actuelle
      navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
      
      // Suivre les changements (pour le widget, on peut utiliser watchPosition aussi)
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    } else if (latitude && longitude) {
      // Si latitude/longitude sont fournies, les utiliser
      setUserPosition({ lat: latitude, lng: longitude });
    }
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [latitude, longitude]);

  useEffect(() => {
    const fetchEnvironmentData = async () => {
      try {
        setLoading(true);
        const data = await getCurrentEnvironmentData(userPosition.lat, userPosition.lng);
        setEnvironmentData(data);
      } catch (err) {
        console.log('Données environnementales non disponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvironmentData();
  }, [userPosition.lat, userPosition.lng]);

  // Déterminer le statut (Sain/Risque) basé sur les données environnementales
  const getStatus = () => {
    if (!environmentData) return 'Sain';
    const pollutionLevel = environmentData.pollution_level || 0;
    if (pollutionLevel > 50) return 'Risque';
    return 'Sain';
  };

  const getAirQualityText = () => {
    if (!environmentData) return 'Non disponible';
    return environmentData.pollution_level_text || 'Non disponible';
  };

  const status = getStatus();
  const isHealthy = status === 'Sain';

  return (
    <div className="w-full relative" style={{ zIndex: 0 }}>
      {/* Carte */}
      <div className={`${height} rounded-lg overflow-hidden border border-gray-200 mb-3 relative`} style={{ zIndex: 0, isolation: 'isolate' }}>
        <MapContainer
          center={[userPosition.lat, userPosition.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%', position: 'relative' }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marqueur position utilisateur */}
          <CircleMarker
            center={[userPosition.lat, userPosition.lng]}
            radius={15}
            pathOptions={{
              color: isHealthy ? '#00A651' : '#FF0000',
              fillColor: isHealthy ? '#00A651' : '#FF0000',
              fillOpacity: 0.3,
              weight: 3
            }}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-gray-800">{status}</div>
                <div className="text-sm text-gray-600">Votre position</div>
                <div className="text-xs text-gray-500 mt-1">
                  {userPosition.lat.toFixed(4)}, {userPosition.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
          
          {/* Point bleu au centre */}
          <CircleMarker
            center={[userPosition.lat, userPosition.lng]}
            radius={5}
            pathOptions={{
              color: '#0066FF',
              fillColor: '#0066FF',
              fillOpacity: 1,
              weight: 2
            }}
          />
        </MapContainer>
      </div>

      {/* Informations sous la carte */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Qualité de l'air</span>
          <span className={`font-semibold ${
            isHealthy ? 'text-primary-green' : 'text-red-600'
          }`}>
            {getAirQualityText()}
          </span>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Sain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Risque</span>
          </div>
        </div>
        <Link 
          to="/map" 
          className="text-primary-green text-sm mt-2 inline-block hover:underline"
        >
          Voir la carte complète
        </Link>
      </div>
    </div>
  );
};

export default MapWidget;
