/**
 * Page Prédictions IA - Version Premium Medical iOS
 * Analyse approfondie du risque de pneumonie avec visualisation de tendance
 * Couleurs dynamiques selon la probabilité
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLatestPrediction, getPredictions } from '../services/sensors';

const Predictions = () => {
  const { user } = useAuth();
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('week');
  const isDoctor = user?.role === 'DOCTOR';

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        try {
          const latest = await getLatestPrediction();
          setLatestPrediction(latest);
        } catch (err) {
          console.log('Aucune prédiction disponible');
        }

        try {
          const params = {};
          const now = new Date();
          if (filter === 'week') {
            params.date_from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          } else if (filter === 'month') {
            params.date_from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          } else if (filter === 'year') {
            params.date_from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          }
          const response = await getPredictions(params);
          setPredictions(response.results || response || []);
        } catch (err) {
          console.log('Erreur lors de la récupération de l\'historique');
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [filter]);

  // ===== FONCTION CENTRALISÉE POUR LES COULEURS =====
  const getColorByProbability = (probability) => {
    const prob = probability * 100;
    
    if (prob >= 70) {
      return {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-100',
        bar: 'bg-red-500',
        label: 'Critique'
      };
    } else if (prob >= 50) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-100',
        bar: 'bg-orange-500',
        label: 'Élevé'
      };
    } else if (prob >= 30) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-100',
        bar: 'bg-amber-400',
        label: 'Modéré'
      };
    } else {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-100',
        bar: 'bg-emerald-500',
        label: 'Faible'
      };
    }
  };

  const getRiskLevelText = (level) => {
    const levels = { 'FAIBLE': 'Faible', 'MODERE': 'Modéré', 'ELEVE': 'Élevé', 'CRITIQUE': 'Critique' };
    return levels[level] || level;
  };

  const formatDate = (dateString, full = false) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', full ? {
      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
    } : { day: '2-digit', month: 'short' });
  };

  const accentColor = isDoctor ? 'indigo' : 'emerald';

  if (loading && predictions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Couleurs pour la dernière prédiction
  const latestColors = latestPrediction ? getColorByProbability(latestPrediction.probabilite_pneumonie_72h) : null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      {/* HEADER iOS STYLE */}
      <div className="mb-10 animate-in slide-in-from-top duration-700">
        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">IA Diagnostique</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Analyse & Risques</h1>
      </div>

      {/* LATEST PREDICTION HERO CARD */}
      {latestPrediction && latestColors ? (
        <div className="relative overflow-hidden bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm mb-8 animate-in zoom-in duration-700">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière Évaluation</h2>
                <p className="text-xs font-bold text-slate-900">{formatDate(latestPrediction.created_at, true)}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border ${latestColors.bg} ${latestColors.text} ${latestColors.border}`}>
                Risque {latestColors.label}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                  <circle 
                    cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={264} 
                    strokeDashoffset={264 - (264 * (latestPrediction.probabilite_pneumonie_72h || 0))}
                    className={`${latestColors.text} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center">
                  <span className="text-xl font-black text-slate-900">{(latestPrediction.probabilite_pneumonie_72h * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 leading-snug">Probabilité d'infection pulmonaire détectée pour les 72h.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-2">Basé sur vos dernières constantes (SpO₂, Température, Fréquence respi).</p>
              </div>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className={`absolute top-0 right-0 w-32 h-32 opacity-30 rounded-full -mr-16 -mt-16 blur-3xl ${latestColors.bg}`}></div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 mb-8">
          <div className="text-4xl mb-4">🔬</div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucune analyse disponible</p>
        </div>
      )}

      {/* TREND SECTION */}
      <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Tendances IA</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Évolution du risque</p>
          </div>
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {['week', 'month'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                {f === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>

        {predictions.length > 0 ? (
          <div>
            <div className="h-32 flex items-end justify-between gap-1.5 px-2 mb-4">
              {predictions.slice(0, 15).reverse().map((pred, idx) => {
                const prob = pred.probabilite_pneumonie_72h * 100;
                const colors = getColorByProbability(pred.probabilite_pneumonie_72h);
                
                return (
                  <div key={idx} className="flex-1 group relative flex flex-col items-center h-full justify-end">
                    <div 
                      className={`w-full ${colors.bar} rounded-t-lg transition-all duration-500 hover:brightness-110 active:scale-x-110`}
                      style={{ height: `${Math.max(prob, 10)}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 shadow-xl">
                        {prob.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
              <span>Antérieur</span>
              <span>Récent</span>
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Historique vide</p>
          </div>
        )}
      </div>

      {/* HISTORY LIST */}
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 ml-2">Historique des Analyses</h3>
      <div className="space-y-4">
        {predictions.slice(0, 10).map((pred, i) => {
          const colors = getColorByProbability(pred.probabilite_pneumonie_72h);
          
          return (
            <div key={i} className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${colors.bg} ${colors.text} border ${colors.border} transition-all`}>
                  <span className="text-xs uppercase leading-none mb-1 opacity-60">Prob.</span>
                  <span className="text-lg">{(pred.probabilite_pneumonie_72h * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Risque {colors.label}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatDate(pred.created_at, true)}</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-[24px] text-xs font-bold border border-red-100 animate-in shake">
          {error}
        </div>
      )}
    </div>
  );
};

export default Predictions;