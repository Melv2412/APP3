/**
 * Page Dashboard Patient
 * Page d'accueil du patient avec résumé des informations clés
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLatestPrediction } from '../services/sensors';
import { getCurrentEnvironmentData } from '../services/environment';
import { getPreventionActions } from '../services/treatments';
import { getNearbyFacilities } from '../services/dashboard';
import { Link } from 'react-router-dom';
import MapWidget from '../components/common/MapWidget';

const Dashboard = () => {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [environmentData, setEnvironmentData] = useState(null);
  const [preventionActions, setPreventionActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPosition, setUserPosition] = useState({ lat: 5.3600, lng: -4.0083 }); // Abidjan par défaut
  
  // États pour les établissements de santé
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesType, setFacilitiesType] = useState('');
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  // Récupérer la position GPS de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.log('Erreur géolocalisation dans Dashboard:', err);
          // Utiliser position par défaut (Abidjan)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000 // Accepter une position mise en cache de moins de 1 minute
        }
      );
    }
  }, []);

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

        // Récupérer les données environnementales avec la position GPS réelle
        try {
          const envData = await getCurrentEnvironmentData(userPosition.lat, userPosition.lng);
          setEnvironmentData(envData);
        } catch (err) {
          console.log('Données environnementales non disponibles');
        }

        // Récupérer les actions préventives prioritaires (3 premières)
        try {
          const actionsData = await getPreventionActions();
          const actions = Array.isArray(actionsData) 
            ? actionsData 
            : (actionsData.results || actionsData.data || []);
          
          // Filtrer les actions non complétées et prioritaires, prendre les 3 premières
          const priorityActions = actions
            .filter(a => !a.completed && (a.priority === 'HIGH' || a.priority === 'HAUTE'))
            .slice(0, 3);
          
          setPreventionActions(priorityActions);
        } catch (err) {
          // Si le backend n'est pas encore implémenté, on ignore silencieusement
          console.log('Actions préventives non disponibles');
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userPosition.lat, userPosition.lng]);

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

  // Fonction pour charger et afficher les établissements proches
  const handleShowFacilities = async (type) => {
    setLoadingFacilities(true);
    setFacilitiesType(type);
    setShowFacilitiesModal(true);
    
    try {
      const data = await getNearbyFacilities(userPosition.lat, userPosition.lng, 10, type);
      setFacilities(data.results || []);
    } catch (err) {
      console.error('Erreur lors du chargement des établissements:', err);
      setFacilities([]);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const status = getStatus();
  const isHealthy = status === 'Sain';
  const userName = user?.first_name || user?.username || 'Utilisateur';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20 pb-24 relative overflow-hidden">
      {/* Fond décoratif avec formes géométriques */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-green/10 to-blue-200/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-gradient-to-tr from-green-200/10 to-primary-green/10 rounded-full blur-2xl"></div>
      </div>

      {/* Section Welcome Banner Modernisée */}
      <div className="relative bg-gradient-to-r from-primary-green via-dark-green to-primary-green text-white px-6 py-8 shadow-lg animate-fade-in">
        <div className="flex items-center gap-4 relative z-10">
          {/* Photo de profil avec effet moderne */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-3xl font-bold shadow-lg transform hover:scale-105 transition-all duration-300">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-300 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1 animate-slide-up animation-delay-200">Bon retour, {userName} !</h2>
            <p className="text-green-100 text-base opacity-90 animate-fade-in animation-delay-400">Prêt à prendre soin de votre santé ?</p>
            <div className="flex items-center gap-2 mt-2 animate-fade-in animation-delay-600">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-200">Connecté et protégé</span>
            </div>
          </div>
        </div>

        {/* Indicateur de statut santé rapide */}
        <div className="mt-6 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-slide-up animation-delay-800">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-300 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-white font-medium">Statut santé: {status}</span>
          </div>
          <div className="text-right">
            <div className="text-green-200 text-sm">Qualité de l'air</div>
            <div className="text-white font-semibold">{getAirQualityText()}</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 relative z-10">
        {/* Section Prédiction Actuelle Modernisée */}
        {prediction && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300 animate-slide-up animation-delay-200 relative overflow-hidden group">
            {/* Fond décoratif subtil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-green/5 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-dark-green rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Prédiction Actuelle</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Probabilité de pneumonie (72h)</span>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-green to-dark-green bg-clip-text text-transparent">
                    {(prediction.probabilite_pneumonie_72h * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Niveau de risque</span>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskLevelColor(prediction.niveau_risque)} shadow-sm`}>
                    {getRiskLevelText(prediction.niveau_risque)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Ma localisation Modernisée */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300 animate-slide-up animation-delay-400 relative overflow-hidden group">
          {/* Fond décoratif subtil */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full -translate-y-6 -translate-x-6"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Ma localisation</h3>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200/50">
              <MapWidget
                latitude={userPosition.lat}
                longitude={userPosition.lng}
                height="h-48"
              />
            </div>
          </div>
        </div>

        {/* Section Actions Préventives Prioritaires Modernisée */}
        {preventionActions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300 animate-slide-up animation-delay-600 relative overflow-hidden group">
            {/* Fond décoratif subtil */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-red-100/20 to-transparent rounded-full translate-y-8 translate-x-8"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Actions Préventives</h3>
                </div>
                <Link
                  to="/actions"
                  className="text-primary-green hover:text-dark-green font-semibold transition-colors flex items-center gap-1 group"
                >
                  <span>Voir tout</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="space-y-3">
                {preventionActions.map((action, index) => (
                  <div
                    key={action.id}
                    className="border border-red-200/50 rounded-xl p-4 bg-gradient-to-r from-red-50/50 to-orange-50/50 hover:from-red-50/70 hover:to-orange-50/70 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${800 + index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {action.action_type === 'AVOID_ZONE' ? '🚫' :
                           action.action_type === 'WEAR_MASK' ? '😷' :
                           action.action_type === 'CHECK_SPO2' ? '📊' :
                           action.action_type === 'CONSULT_DOCTOR' ? '👨‍⚕️' :
                           action.action_type === 'STAY_HOME' ? '🏠' : '📋'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                          {action.recommendation_text || action.text || 'Action préventive'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            🔥 Priorité Haute
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section facteurs autour & services Modernisée */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 hover:shadow-2xl transition-all duration-300 animate-slide-up animation-delay-800 relative overflow-hidden group">
          {/* Fond décoratif subtil */}
          <div className="absolute top-0 left-1/2 w-40 h-40 bg-gradient-to-br from-green-100/20 to-blue-100/20 rounded-full -translate-y-10 -translate-x-1/2 blur-xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Services & Facteurs</h3>
            </div>

            {/* Trois boutons carrés verts modernisés */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Facteurs */}
              <button 
                onClick={() => handleShowFacilities(null)}
                className="group aspect-square bg-gradient-to-br from-primary-green to-dark-green text-white rounded-2xl flex flex-col items-center justify-center hover:from-dark-green hover:to-primary-green transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-8 h-8 mb-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm font-bold text-center relative z-10 leading-tight">Facteurs<br/>environnementaux</span>
              </button>

              {/* Hôpitaux Généraux */}
              <button 
                onClick={() => handleShowFacilities('HOSPITAL')}
                className="group aspect-square bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex flex-col items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-8 h-8 mb-3 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-bold text-center relative z-10 leading-tight">Hôpitaux<br/>Généraux</span>
              </button>

              {/* Centres de pneumologies */}
              <button 
                onClick={() => handleShowFacilities('PNEUMOLOGY_CENTER')}
                className="group aspect-square bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex flex-col items-center justify-center hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-8 h-8 mb-3 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-bold text-center relative z-10 leading-tight">Centres de<br/>pneumologie</span>
              </button>
            </div>

            {/* Tabs services modernisés */}
            <div className="border-t border-gray-200/50 pt-6">
              <div className="flex gap-3 mb-4 p-1 bg-gray-100/50 rounded-xl">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-green to-dark-green text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-300">
                  Services en ligne
                </button>
                <button className="flex-1 px-4 py-2 bg-white text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-all duration-300">
                  Service 24x7
                </button>
                <button className="flex-1 px-4 py-2 bg-white text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-all duration-300">
                  Autres services
                </button>
              </div>
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100/50">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-gray-600 font-medium">Services à venir</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur modernisé */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm animate-shake flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Message de chargement modernisé */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-4 px-8 py-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50">
              <div className="w-8 h-8 border-4 border-primary-green/30 border-t-primary-green rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Chargement des données...</span>
            </div>
          </div>
        )}
      </div>

      {/* Modale des établissements de santé */}
      {showFacilitiesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slide-up">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-primary-green to-dark-green text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {facilitiesType === 'HOSPITAL' ? 'Hôpitaux Généraux' : 
                   facilitiesType === 'PNEUMOLOGY_CENTER' ? 'Centres de Pneumologie' : 
                   'Tous les Établissements'}
                </h3>
                <p className="text-sm opacity-90 mt-1">Dans un rayon de 10 km</p>
              </div>
              <button 
                onClick={() => setShowFacilitiesModal(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingFacilities ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-green/30 border-t-primary-green rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-4">Recherche en cours...</p>
                </div>
              ) : facilities.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-600 font-medium">Aucun établissement trouvé à proximité</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all border border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">{facility.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{facility.address}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {facility.facility_type_display}
                            </span>
                            {facility.has_emergency && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                Urgences 24h/24
                              </span>
                            )}
                            {facility.has_pneumology && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                Service Pneumologie
                              </span>
                            )}
                          </div>

                          {facility.phone && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${facility.phone}`} className="hover:text-primary-green font-medium">
                                {facility.phone}
                              </a>
                            </div>
                          )}

                          {facility.opening_hours && (
                            <p className="text-xs text-gray-500 mt-2">
                              🕒 {facility.opening_hours}
                            </p>
                          )}
                        </div>

                        {facility.distance_km !== null && (
                          <div className="flex-shrink-0 text-right">
                            <div className="bg-primary-green text-white px-3 py-2 rounded-lg">
                              <p className="text-2xl font-bold">{facility.distance_km}</p>
                              <p className="text-xs opacity-90">km</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
