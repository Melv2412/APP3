/**
 * Page Dashboard Patient
 * Page d'accueil du patient avec résumé des informations clés
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLatestPrediction } from '../services/sensors';
import { getCurrentEnvironmentData } from '../services/environment';
import MapWidget from '../components/common/MapWidget';

const Dashboard = () => {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [environmentData, setEnvironmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer la dernière prédiction
        try {
          const predData = await getLatestPrediction();
          setPrediction(predData);
        } catch (err) {
          // Si pas de prédiction, c'est OK (utilisateur sans données)
          console.log('Aucune prédiction disponible');
        }

        // Récupérer les données environnementales (si position disponible)
        // Pour l'instant, utiliser des coordonnées par défaut (Abidjan)
        // TODO: Récupérer la position GPS réelle
        const defaultLat = 5.3600;
        const defaultLng = -4.0083;
        try {
          const envData = await getCurrentEnvironmentData(defaultLat, defaultLng);
          setEnvironmentData(envData);
        } catch (err) {
          console.log('Données environnementales non disponibles');
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour obtenir le texte du niveau de risque
  const getRiskLevelText = (level) => {
    const levels = {
      'FAIBLE': 'Faible',
      'MODERE': 'Modéré',
      'ELEVE': 'Élevé',
      'CRITIQUE': 'Critique'
    };
    return levels[level] || level;
  };

  // Fonction pour obtenir la couleur du niveau de risque
  const getRiskLevelColor = (level) => {
    const colors = {
      'FAIBLE': 'text-green-600 bg-green-50',
      'MODERE': 'text-yellow-600 bg-yellow-50',
      'ELEVE': 'text-orange-600 bg-orange-50',
      'CRITIQUE': 'text-red-600 bg-red-50'
    };
    return colors[level] || 'text-gray-600 bg-gray-50';
  };

  // Fonction pour obtenir le texte de qualité de l'air
  const getAirQualityText = () => {
    if (!environmentData) return 'Non disponible';
    return environmentData.pollution_level_text || 'Bonne';
  };

  const getStatus = () => {
    if (!environmentData) return 'Sain';
    const pollutionLevel = environmentData.pollution_level || 0;
    if (pollutionLevel > 50) return 'Risque';
    return 'Sain';
  };

  const status = getStatus();
  const isHealthy = status === 'Sain';
  const userName = user?.first_name || user?.username || 'Utilisateur';

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Section Welcome Banner */}
      <div className="bg-primary-green text-white px-4 py-6 relative" style={{ zIndex: 1 }}>
        <div className="flex items-center gap-4">
          {/* Photo de profil (placeholder) */}
          <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">Bon retour, {userName} !</h2>
            <p className="text-green-100 text-sm">Bienvenue sur votre tableau de bord</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Section Prédiction Actuelle */}
        {prediction && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 relative" style={{ zIndex: 1 }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Prédiction Actuelle</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Probabilité de pneumonie (72h)</span>
                <span className="text-2xl font-bold text-primary-green">
                  {(prediction.probabilite_pneumonie_72h * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Niveau de risque</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(prediction.niveau_risque)}`}>
                  {getRiskLevelText(prediction.niveau_risque)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section Ma localisation (Widget Carte) */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 relative" style={{ zIndex: 0 }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 relative" style={{ zIndex: 1 }}>Ma localisation</h3>
          <MapWidget 
            latitude={5.3600} 
            longitude={-4.0083}
            height="h-48"
          />
        </div>

        {/* Section facteurs autour & services */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 relative" style={{ zIndex: 1 }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Facteurs autour & services</h3>
          
          {/* Trois boutons carrés verts */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Facteurs */}
            <button className="aspect-square bg-primary-green text-white rounded-lg flex flex-col items-center justify-center hover:bg-dark-green transition-colors">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs font-semibold text-center">facteurs</span>
            </button>

            {/* Hôpitaux Généraux */}
            <button className="aspect-square bg-primary-green text-white rounded-lg flex flex-col items-center justify-center hover:bg-dark-green transition-colors">
              <span className="text-2xl font-bold mb-2">H</span>
              <span className="text-xs font-semibold text-center">Hôpitaux Généraux</span>
            </button>

            {/* Centres de pneumologies */}
            <button className="aspect-square bg-primary-green text-white rounded-lg flex flex-col items-center justify-center hover:bg-dark-green transition-colors">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-semibold text-center">Centres de pneumologies</span>
            </button>
          </div>

          {/* Tabs services (placeholder) */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-1 bg-primary-green text-white rounded text-sm font-semibold">
                Services en ligne
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                Service 24x7
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                Autres services
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center py-4">
              Services à venir
            </p>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Message de chargement */}
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Chargement des données...
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
