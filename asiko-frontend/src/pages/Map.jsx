/**
 * Page Map (Cartographie et Zones à Risque)
 * Carte interactive avec zones de pollution et zones à risque
 */
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import { getNearbyEnvironmentData } from '../services/environment';

// Composant pour centrer la carte sur la position de l'utilisateur
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

const Map = () => {
  const [userPosition, setUserPosition] = useState({ lat: 5.3600, lng: -4.0083 }); // Abidjan par défaut
  const [environmentData, setEnvironmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtres
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showPollution, setShowPollution] = useState(true);
  const [riskLevelFilter, setRiskLevelFilter] = useState('all'); // all, low, moderate, high

  useEffect(() => {
    // Récupérer la position GPS de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.log('Erreur géolocalisation:', err);
          // Utiliser position par défaut (Abidjan)
        }
      );
    }

    // Récupérer les données environnementales proches
    const fetchEnvironmentData = async () => {
      try {
        setLoading(true);
        // Récupérer les données dans un rayon de 10km
        const data = await getNearbyEnvironmentData(userPosition.lat, userPosition.lng, 10000);
        const dataArray = Array.isArray(data) ? data : (data.results || []);
        setEnvironmentData(dataArray);
      } catch (err) {
        console.error('Erreur lors de la récupération des données environnementales:', err);
        setError('Impossible de charger les données de la carte');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvironmentData();
  }, [userPosition.lat, userPosition.lng]);

  // Déterminer le niveau de risque d'une zone
  const getRiskLevel = (data) => {
    const pollutionLevel = data.pollution_level || 0;
    if (pollutionLevel > 70) return 'high';
    if (pollutionLevel > 40) return 'moderate';
    return 'low';
  };

  // Obtenir la couleur selon le niveau de risque
  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return '#FF0000'; // Rouge
      case 'moderate':
        return '#FFCC00'; // Jaune
      case 'low':
        return '#00A651'; // Vert
      default:
        return '#CCCCCC'; // Gris
    }
  };

  // Filtrer les données selon les filtres actifs
  const filteredData = environmentData.filter((data) => {
    if (!showPollution) return false;
    const level = getRiskLevel(data);
    if (riskLevelFilter !== 'all' && level !== riskLevelFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header avec filtres */}
      <div className="bg-white shadow-sm sticky top-0 z-40 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-800 mb-3">Cartographie des Zones à Risque</h1>
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {/* Toggle Zones à Risque */}
          <button
            onClick={() => setShowRiskZones(!showRiskZones)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              showRiskZones
                ? 'bg-primary-green text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Zones à Risque
          </button>

          {/* Toggle Pollution */}
          <button
            onClick={() => setShowPollution(!showPollution)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              showPollution
                ? 'bg-primary-green text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pollution
          </button>

          {/* Filtre Niveau de Risque */}
          <select
            value={riskLevelFilter}
            onChange={(e) => setRiskLevelFilter(e.target.value)}
            className="px-3 py-1 rounded-lg text-sm font-semibold border border-gray-300 bg-white"
          >
            <option value="all">Tous les niveaux</option>
            <option value="low">Faible</option>
            <option value="moderate">Modéré</option>
            <option value="high">Élevé</option>
          </select>
        </div>
      </div>

      {/* Carte */}
      <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
        <MapContainer
          center={[userPosition.lat, userPosition.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Centrer la carte sur la position utilisateur */}
          <MapCenter center={[userPosition.lat, userPosition.lng]} zoom={13} />

          {/* Marqueur position utilisateur */}
          <CircleMarker
            center={[userPosition.lat, userPosition.lng]}
            radius={10}
            pathOptions={{
              color: '#0066FF',
              fillColor: '#0066FF',
              fillOpacity: 0.5,
              weight: 3
            }}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-gray-800">Votre position</div>
                <div className="text-sm text-gray-600">
                  {userPosition.lat.toFixed(4)}, {userPosition.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </CircleMarker>

          {/* Zones de pollution/risque */}
          {showRiskZones && filteredData.map((data, index) => {
            const level = getRiskLevel(data);
            const color = getRiskColor(level);
            const radius = level === 'high' ? 500 : level === 'moderate' ? 300 : 200;

            return (
              <Circle
                key={index}
                center={[data.latitude || data.lat, data.longitude || data.lng]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800 mb-2">
                      Zone {level === 'high' ? 'à Risque Élevé' : level === 'moderate' ? 'à Risque Modéré' : 'Saine'}
                    </div>
                    {data.pollution_level !== undefined && (
                      <div className="text-gray-600 mb-1">
                        Niveau de pollution: {data.pollution_level.toFixed(1)}
                      </div>
                    )}
                    {data.pm25 !== undefined && (
                      <div className="text-gray-600 mb-1">PM2.5: {data.pm25.toFixed(1)} µg/m³</div>
                    )}
                    {data.pm10 !== undefined && (
                      <div className="text-gray-600 mb-1">PM10: {data.pm10.toFixed(1)} µg/m³</div>
                    )}
                    {data.pollution_level_text && (
                      <div className="text-gray-600">Qualité: {data.pollution_level_text}</div>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

      {/* Légende */}
      <div className="bg-white shadow-sm px-4 py-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Zone Saine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700">Risque Modéré</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-700">Risque Élevé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">Votre position</span>
          </div>
        </div>
      </div>

      {/* Messages d'erreur/chargement */}
      {loading && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm text-gray-600">Chargement de la carte...</p>
        </div>
      )}

      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default Map;
