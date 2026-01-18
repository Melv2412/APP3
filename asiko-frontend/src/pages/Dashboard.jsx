import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLatestPrediction } from '../services/sensors';
import { getCurrentEnvironmentData } from '../services/environment';
import { getPreventionActions } from '../services/treatments';
import { getNearbyFacilities } from '../services/dashboard';
import { Link } from 'react-router-dom';
import MapWidget from '../components/common/MapWidget';
import useAlertSSE from "../hooks/useAlertSSE";



const Dashboard = () => {
  const { user } = useAuth();
  useAlertSSE();

  const [prediction, setPrediction] = useState(null);
  const [environmentData, setEnvironmentData] = useState(null);
  const [preventionActions, setPreventionActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPosition, setUserPosition] = useState({ lat: 5.3600, lng: -4.0083 }); // Abidjan par défaut

  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesType, setFacilitiesType] = useState('');
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  // LOGIQUE GÉOLOCALISATION (STRICTEMENT IDENTIQUE)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.log('Erreur géolocalisation:', err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  // LOGIQUE RÉCUPÉRATION DONNÉES (STRICTEMENT IDENTIQUE)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        try {
          const predData = await getLatestPrediction();
          setPrediction(predData);
        } catch (err) { console.log('Aucune prédiction disponible'); }

        try {
          const envData = await getCurrentEnvironmentData(userPosition.lat, userPosition.lng);
          setEnvironmentData(envData);
        } catch (err) { console.log('Données environnementales non disponibles'); }

        try {
          const actionsData = await getPreventionActions();
          const actions = Array.isArray(actionsData) ? actionsData : (actionsData.results || actionsData.data || []);
          const priorityActions = actions
            .filter(a => !a.completed && (a.priority === 'HIGH' || a.priority === 'HAUTE'))
            .slice(0, 3);
          setPreventionActions(priorityActions);
        } catch (err) { console.log('Actions préventives non disponibles'); }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userPosition.lat, userPosition.lng]);    




  // FONCTIONS UTILITAIRES DE STYLE (CONSERVÉES)
  const getRiskLevelText = (level) => {
    const levels = { 'FAIBLE': 'Faible', 'MODERE': 'Modéré', 'ELEVE': 'Élevé', 'CRITIQUE': 'Critique' };
    return levels[level] || level;
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      'FAIBLE': 'text-emerald-600 bg-emerald-50 border-emerald-100',
      'MODERE': 'text-amber-600 bg-amber-50 border-amber-100',
      'ELEVE': 'text-orange-600 bg-orange-50 border-orange-100',
      'CRITIQUE': 'text-rose-600 bg-rose-50 border-rose-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-50 border-gray-100';
  };

  const getAirQualityText = () => environmentData?.pollution_level_text || 'Analyse...';

  const getStatus = () => {
    if (!environmentData) return 'Sain';
    return (environmentData.pollution_level || 0) > 50 ? 'Risque' : 'Sain';
  };

  const handleShowFacilities = async (type) => {
    setLoadingFacilities(true);
    setFacilitiesType(type);
    setShowFacilitiesModal(true);
    try {
      const data = await getNearbyFacilities(userPosition.lat, userPosition.lng, 10, type);
      setFacilities(data.results || []);
    } catch (err) {
      console.error(err);
      setFacilities([]);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const status = getStatus();
  const isHealthy = status === 'Sain';
  const userName = user?.first_name || user?.username || 'Utilisateur';

  return (
    <div className="min-h-screen bg-[#F2F4F7] pb-32 font-sans antialiased text-slate-900">

      {/* 1. TOP BANNER : STYLE IMMERSIF NÉO-MODERNE */}
      <header className="relative bg-[#0F172A] pt-14 pb-28 px-6 overflow-hidden">
        {/* Cercles de lumière décoratifs */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[80px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-6 mb-10">
            <div className="relative group">
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-emerald-400 to-teal-500 p-[3px] shadow-2xl transition-transform group-hover:scale-105">
                <div className="w-full h-full rounded-[21px] bg-[#0F172A] flex items-center justify-center text-3xl font-black text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-[4px] border-[#0F172A] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Bonjour, {userName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-400 font-medium">Connecté au réseau de santé</span>
                <span className="h-1 w-1 bg-slate-600 rounded-full" />
                <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">En direct</span>
              </div>
            </div>
          </div>

          {/* STATUS CARDS OVERLAY */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-all">
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Statut Santé</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'}`} />
                <span className="text-white text-xl font-bold">{status}</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-all text-right">
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Qualité de l'air</p>
              <p className="text-white text-xl font-bold">{getAirQualityText()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-5xl mx-auto px-6 -mt-10 relative z-20 space-y-8">

        {/* SECTION PRÉDICTION : GRANDE CARTE DE RELIEF */}
        {prediction && (
          <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3v10h10V3H13zM3 13h10v10H3V13zm0-10h10v10H3V3zm10 10h10v10H13V13z" /></svg>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={440} strokeDashoffset={440 - (440 * prediction.probabilite_pneumonie_72h)}
                    className="text-emerald-500 transition-all duration-1000 ease-in-out" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900">{(prediction.probabilite_pneumonie_72h * 100).toFixed(1)}%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Probabilité</span>
                </div>
              </div>

              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 font-black text-xs uppercase italic">Prédiction 72h</div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Analyse Pulmonaire</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className={`px-5 py-3 rounded-2xl border-2 flex items-center gap-3 ${getRiskLevelColor(prediction.niveau_risque)}`}>
                    <span className="text-sm font-black uppercase tracking-wider">Risque {getRiskLevelText(prediction.niveau_risque)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* CARTE LOCALISATION / MAP */}
          <div className="bg-white rounded-[32px] p-3 shadow-sm border border-slate-200/60 flex flex-col">
            <div className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Zone de Surveillance</h3>
            </div>
            <div className="flex-1 rounded-[24px] overflow-hidden border border-slate-100">
              <MapWidget latitude={userPosition.lat} longitude={userPosition.lng} height="h-[300px]" />
            </div>
          </div>

          {/* ACTIONS PRÉVENTIVES : LISTE ÉPURÉE */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Actions Prioritaires</h3>
              <Link to="/actions" className="text-emerald-500 font-bold text-sm hover:underline">Voir tout</Link>
            </div>

            <div className="space-y-4">
              {preventionActions.length > 0 ? preventionActions.map((action, idx) => (
                <div key={action.id} className="group p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-emerald-50/50 transition-all flex items-start gap-4">
                  <span className="text-2xl">{
                    action.action_type === 'AVOID_ZONE' ? '🚫' :
                      action.action_type === 'WEAR_MASK' ? '😷' : '📋'
                  }</span>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-slate-800 leading-snug">{action.recommendation_text || action.text}</p>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 block italic">🔥 Urgent</span>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-400 font-medium italic">Aucune action urgente</div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION SERVICES & SERVICES À VENIR */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-200/60 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Services & Facteurs</h3>
              <p className="text-slate-400 font-medium">Trouvez de l'aide à proximité immédiatement.</p>
            </div>
            {/* Segmented control style tabs */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
              <button className="px-4 py-2 bg-white rounded-[12px] shadow-sm text-xs font-black text-slate-900">Services en ligne</button>
              <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Service 24x7</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <button onClick={() => handleShowFacilities(null)} className="group p-8 rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col items-center gap-4 transition-all hover:shadow-xl hover:-translate-y-1">
              <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="font-black text-center text-sm uppercase tracking-tighter leading-tight">Facteurs Environnementaux</span>
            </button>
            <button onClick={() => handleShowFacilities('HOSPITAL')} className="group p-8 rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center gap-4 transition-all hover:shadow-xl hover:-translate-y-1">
              <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span className="font-black text-center text-sm uppercase tracking-tighter leading-tight">Hôpitaux Généraux</span>
            </button>
            <button onClick={() => handleShowFacilities('PNEUMOLOGY_CENTER')} className="group p-8 rounded-[32px] bg-gradient-to-br from-purple-500 to-pink-600 text-white flex flex-col items-center gap-4 transition-all hover:shadow-xl hover:-translate-y-1">
              <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <span className="font-black text-center text-sm uppercase tracking-tighter leading-tight">Centres Pneumologie</span>
            </button>
          </div>

          <div className="py-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <span className="text-sm font-bold italic tracking-tight uppercase">Expansion des services prévue prochainement</span>
          </div>
        </div>

        {/* GESTION DES ÉTATS : ERREUR & CHARGEMENT */}
        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-6 rounded-[32px] flex items-center gap-5 animate-pulse">
            <span className="text-2xl">⚠️</span>
            <p className="font-black italic">{error}</p>
          </div>
        )}

        {loading && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border border-white flex items-center gap-4 z-[100]">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-black text-slate-800 tracking-tighter uppercase italic">Mise à jour des biométries...</span>
          </div>
        )}
      </main>

      {/* 3. MODALE ÉTABLISSEMENTS : STYLE iOS FULL SCREEN SHEET */}
      {showFacilitiesModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowFacilitiesModal(false)} />
          <div className="relative bg-[#F8FAFC] w-full max-w-2xl rounded-t-[40px] sm:rounded-[40px] max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 duration-500">

            <div className="sticky top-0 bg-white border-b border-slate-100 p-8 flex justify-between items-center z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {facilitiesType === 'HOSPITAL' ? 'Hôpitaux Généraux' :
                    facilitiesType === 'PNEUMOLOGY_CENTER' ? 'Centres de Pneumologie' : 'Établissements'}
                </h3>
                <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mt-1">Rayon 10 KM • GPS Actif</p>
              </div>
              <button onClick={() => setShowFacilitiesModal(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 font-black">✕</button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              {loadingFacilities ? (
                <div className="py-20 text-center space-y-4 animate-pulse">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-400 font-black italic tracking-tighter uppercase">Scanning de la zone...</p>
                </div>
              ) : facilities.length === 0 ? (
                <div className="py-20 text-center opacity-40">
                  <p className="text-2xl mb-2">📍</p>
                  <p className="font-black uppercase tracking-widest text-sm">Zone non couverte</p>
                </div>
              ) : facilities.map((f) => (
                <div key={f.id} className="bg-white rounded-[28px] p-6 border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 text-lg leading-none mb-1">{f.name}</h4>
                    <p className="text-sm text-slate-400 font-medium">{f.address}</p>
                    <div className="flex gap-2 mt-4">
                      {f.has_emergency && <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase">Urgences 24h</span>}
                      {f.has_pneumology && <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase">Pneumologie</span>}
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white px-5 py-4 rounded-3xl text-center group-hover:bg-emerald-600 transition-colors">
                    <p className="text-2xl font-black leading-none">{f.distance_km}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">km</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;