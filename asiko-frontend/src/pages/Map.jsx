/**
 * Page Map (Cartographie et Zones à Risque)
 * Carte interactive avec zones de pollution et zones à risque
 */
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import { getNearbyEnvironmentData } from '../services/environment';

// Composant pour centrer la carte sur la position de l'utilisateur
function MapCenter({ center, zoom, animate = true }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      try {
        const currentCenter = map.getCenter();
        const distance = map.distance(currentCenter, center);
        
        console.log('🗺️ MapCenter - Position actuelle carte:', currentCenter);
        console.log('🗺️ MapCenter - Position cible:', center);
        console.log('🗺️ MapCenter - Distance:', Math.round(distance), 'mètres');
        
        // Toujours centrer si la distance est significative (plus de 10 mètres)
        // ou si on passe de la position par défaut à une vraie position GPS
        const isFromDefault = currentCenter.lat === 5.3600 && currentCenter.lng === -4.0083;
        const isToDefault = center[0] === 5.3600 && center[1] === -4.0083;
        
        if (distance > 10 || (isFromDefault && !isToDefault)) {
          console.log('🗺️ Centrage de la carte avec flyTo (distance:', Math.round(distance), 'm)');
          // Utiliser flyTo pour une animation visible
          map.flyTo(center, zoom, {
            animate: animate,
            duration: 1.5
          });
        } else if (distance > 1) {
          // Pour les petits déplacements, utiliser setView avec animation douce
          console.log('🗺️ Petit ajustement de position (distance:', Math.round(distance), 'm)');
          map.setView(center, zoom, { animate: true, duration: 0.3 });
        }
      } catch (error) {
        console.error('❌ Erreur dans MapCenter:', error);
        // En cas d'erreur, forcer le centrage
        map.setView(center, zoom, { animate: false });
      }
    }
  }, [map, center, zoom, animate]);
  return null;
}

const Map = () => {
  const [userPosition, setUserPosition] = useState({ lat: 5.3600, lng: -4.0083 }); // Abidjan par défaut
  const [environmentData, setEnvironmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingEnabled, setTrackingEnabled] = useState(true); // Suivi de position activé par défaut
  const [geoError, setGeoError] = useState('');
  const [manualPosition, setManualPosition] = useState({ lat: '', lng: '' });
  const [showManualInput, setShowManualInput] = useState(false);
  
  // Filtres
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showPollution, setShowPollution] = useState(true);
  const [riskLevelFilter, setRiskLevelFilter] = useState('all'); // all, low, moderate, high

  // Récupérer les données environnementales proches
  const fetchEnvironmentData = async (lat, lng) => {
    try {
      setLoading(true);
      setError('');
      // Récupérer les données dans un rayon de 10km
      const data = await getNearbyEnvironmentData(lat, lng, 10000);
      const dataArray = Array.isArray(data) ? data : (data.results || []);
      setEnvironmentData(dataArray);
    } catch (err) {
      console.error('Erreur lors de la récupération des données environnementales:', err);
      setError('Impossible de charger les données de la carte');
    } finally {
      setLoading(false);
    }
  };

  // Effet pour le suivi de position en temps réel
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('La géolocalisation n\'est pas supportée par votre navigateur');
      // Charger les données avec position par défaut
      fetchEnvironmentData(userPosition.lat, userPosition.lng);
      return;
    }

    let currentWatchId = null;

    if (trackingEnabled) {
      // Options pour la géolocalisation
      const geoOptions = {
        enableHighAccuracy: true, // Utiliser GPS si disponible
        timeout: 15000, // Augmenter le timeout
        maximumAge: 5000 // Accepter une position de moins de 5 secondes
      };
      
      console.log('📍 Démarrage du suivi de position en temps réel...');

      // Fonction de succès
      const onSuccess = (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Log pour déboguer
        console.log('📍 Position GPS récupérée:', newPosition);
        console.log('📍 Précision:', position.coords.accuracy, 'mètres');
        
        // Toujours mettre à jour la position (même si légèrement différente)
        // pour s'assurer que la carte se déplace visuellement
        const hasChanged = Math.abs(newPosition.lat - userPosition.lat) > 0.00001 || 
                          Math.abs(newPosition.lng - userPosition.lng) > 0.00001;
        
        if (hasChanged || userPosition.lat === 5.3600) {
          console.log('📍 Position changée, mise à jour de la carte');
          console.log('📍 Ancienne position:', userPosition);
          console.log('📍 Nouvelle position:', newPosition);
          
          // Calculer la distance en mètres
          const R = 6371000; // Rayon de la Terre en mètres
          const dLat = (newPosition.lat - userPosition.lat) * Math.PI / 180;
          const dLng = (newPosition.lng - userPosition.lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userPosition.lat * Math.PI / 180) * Math.cos(newPosition.lat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          console.log('📍 Distance déplacée:', Math.round(distance), 'mètres');
          
          setUserPosition(newPosition);
          setGeoError('');
          // Recharger les données environnementales avec la nouvelle position
          fetchEnvironmentData(newPosition.lat, newPosition.lng);
        }
      };

      // Fonction d'erreur
      const onError = (err) => {
        console.error('❌ Erreur géolocalisation:', err);
        console.error('❌ Code erreur:', err.code);
        let errorMessage = 'Impossible d\'obtenir votre position';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '⚠️ Accès à la géolocalisation refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur (icône cadenas dans la barre d\'adresse).';
            console.error('❌ Permission refusée - L\'utilisateur doit autoriser la géolocalisation');
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '⚠️ Position indisponible. Vérifiez que votre GPS est activé et que vous avez une bonne connexion.';
            console.error('❌ Position indisponible - GPS peut-être désactivé');
            break;
          case err.TIMEOUT:
            errorMessage = '⚠️ Délai d\'attente dépassé. Vérifiez votre connexion internet et GPS.';
            console.error('❌ Timeout - La géolocalisation prend trop de temps');
            break;
          default:
            errorMessage = `⚠️ Erreur de géolocalisation: ${err.message || 'Erreur inconnue'}`;
            console.error('❌ Erreur inconnue:', err);
        }
        setGeoError(errorMessage);
        // Charger les données avec position par défaut si première erreur
        if (userPosition.lat === 5.3600 && userPosition.lng === -4.0083) {
          console.log('📍 Utilisation de la position par défaut (Abidjan)');
          fetchEnvironmentData(userPosition.lat, userPosition.lng);
        }
      };

      // D'abord, obtenir la position actuelle
      navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);

      // Ensuite, suivre les changements de position en temps réel
      currentWatchId = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    }

    // Nettoyer le watchPosition quand le composant se démonte ou que trackingEnabled change
    return () => {
      if (currentWatchId !== null) {
        navigator.geolocation.clearWatch(currentWatchId);
      }
    };
  }, [trackingEnabled]);

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
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Cartographie des Zones à Risque</h1>
            {/* Affichage de la position actuelle */}
            <div className="text-xs text-gray-500 mt-1">
              Position: {userPosition.lat.toFixed(6)}, {userPosition.lng.toFixed(6)}
              {userPosition.lat === 5.3600 && userPosition.lng === -4.0083 && (
                <span className="text-yellow-600 ml-2">(Par défaut - Abidjan)</span>
              )}
            </div>
          </div>
          {/* Toggle Suivi de Position */}
          <div className="flex items-center gap-2">
            {trackingEnabled && !geoError && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>GPS actif</span>
              </div>
            )}
            <button
              onClick={() => {
                console.log('🔄 Toggle suivi:', !trackingEnabled);
                setTrackingEnabled(!trackingEnabled);
                if (!trackingEnabled) {
                  setGeoError(''); // Réinitialiser l'erreur si on réactive
                }
              }}
              className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                trackingEnabled
                  ? 'bg-primary-green text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              title={trackingEnabled ? 'Désactiver le suivi de position' : 'Activer le suivi de position'}
            >
              <span>📍</span>
              <span>{trackingEnabled ? 'Suivi actif' : 'Suivi inactif'}</span>
            </button>
            {/* Bouton pour forcer la récupération de position */}
            <button
              onClick={() => {
                console.log('🔄 Forcer la récupération de position...');
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const newPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      };
                      console.log('✅ Position forcée récupérée:', newPosition);
                      setUserPosition(newPosition);
                      setGeoError('');
                      fetchEnvironmentData(newPosition.lat, newPosition.lng);
                    },
                    (err) => {
                      console.error('❌ Erreur lors de la récupération forcée:', err);
                      setGeoError('Impossible de récupérer votre position. Vérifiez les permissions.');
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 15000,
                      maximumAge: 0
                    }
                  );
                }
              }}
              className="px-3 py-1 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Forcer la récupération de votre position actuelle"
            >
              🔄 Actualiser
            </button>
            {/* Bouton pour saisir manuellement la position */}
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="px-3 py-1 rounded-lg text-sm font-semibold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              title="Saisir manuellement votre position (pour tester)"
            >
              📍 Position manuelle
            </button>
          </div>
        </div>
        
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
        
        {/* Input manuel de position */}
        {showManualInput && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-semibold text-purple-800 mb-2">📍 Saisir votre position manuellement</p>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                placeholder="Latitude (ex: 5.2111)"
                value={manualPosition.lat}
                onChange={(e) => setManualPosition({ ...manualPosition, lat: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-purple-300 text-sm"
              />
              <input
                type="number"
                step="0.000001"
                placeholder="Longitude (ex: -4.2778)"
                value={manualPosition.lng}
                onChange={(e) => setManualPosition({ ...manualPosition, lng: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-purple-300 text-sm"
              />
              <button
                onClick={() => {
                  const lat = parseFloat(manualPosition.lat);
                  const lng = parseFloat(manualPosition.lng);
                  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    console.log('📍 Position manuelle définie:', { lat, lng });
                    setUserPosition({ lat, lng });
                    setGeoError('');
                    fetchEnvironmentData(lat, lng);
                    setShowManualInput(false);
                  } else {
                    alert('Coordonnées invalides. Latitude: -90 à 90, Longitude: -180 à 180');
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                Appliquer
              </button>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              💡 Exemple pour Bassam: Latitude: 5.2111, Longitude: -4.2778
            </p>
          </div>
        )}
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

          {/* Centrer la carte sur la position utilisateur (avec animation) */}
          <MapCenter 
            center={[userPosition.lat, userPosition.lng]} 
            zoom={13} 
            animate={true}
          />

          {/* Marqueur position utilisateur - avec clé unique pour forcer le re-render */}
          <CircleMarker
            key={`user-marker-${userPosition.lat}-${userPosition.lng}`}
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
                <div className="font-semibold text-gray-800">📍 Votre position</div>
                <div className="text-sm text-gray-600">
                  {userPosition.lat.toFixed(6)}, {userPosition.lng.toFixed(6)}
                </div>
                {userPosition.lat === 5.3600 && userPosition.lng === -4.0083 && (
                  <div className="text-xs text-yellow-600 mt-1">
                    ⚠️ Position par défaut (Abidjan)
                  </div>
                )}
                {trackingEnabled && !geoError && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Suivi actif
                  </div>
                )}
                {geoError && (
                  <div className="text-xs text-red-600 mt-1">
                    ❌ Erreur GPS
                  </div>
                )}
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

      {geoError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Géolocalisation</p>
              <p className="text-xs mb-2">{geoError}</p>
              {geoError.includes('refusé') && (
                <div className="text-xs bg-yellow-100 p-2 rounded mb-2">
                  <p className="font-semibold mb-1">Comment autoriser :</p>
                  <ol className="list-decimal list-inside space-y-1 text-yellow-900">
                    <li>Cliquez sur l'icône 🔒 (cadenas) dans la barre d'adresse</li>
                    <li>Allez dans "Paramètres du site"</li>
                    <li>Autorisez "Localisation"</li>
                    <li>Rechargez la page</li>
                  </ol>
                </div>
              )}
              <button
                onClick={() => {
                  setGeoError('');
                  setTrackingEnabled(true);
                  // Forcer une nouvelle demande de permission
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setUserPosition({
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude
                        });
                        setGeoError('');
                      },
                      (err) => {
                        console.error('Erreur après retry:', err);
                      },
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  }
                }}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded font-semibold transition-colors"
              >
                Réessayer
              </button>
              <p className="text-xs mt-2 text-yellow-700">Utilisation de la position par défaut (Abidjan) en attendant</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
