/**
 * Page Actions Préventives
 * Affiche les actions préventives recommandées basées sur les prédictions, alertes et zones à risque
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPreventionActions, completePreventionAction } from '../services/treatments';

const PreventionActions = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, priority

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getPreventionActions();
        // Gérer différents formats de réponse
        const actionsData = Array.isArray(response) 
          ? response 
          : (response.results || response.data || []);
        
        setActions(actionsData);
      } catch (err) {
        // Si le backend n'est pas encore implémenté, on affiche un message
        if (err.response?.status === 404 || err.response?.status === 500) {
          setError('Le service d\'actions préventives n\'est pas encore disponible. Il sera bientôt activé.');
          setActions([]);
        } else {
          setError('Erreur lors du chargement des actions préventives');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchActions();
    }
  }, [user]);

  const handleComplete = async (actionId) => {
    try {
      setError('');
      setSuccess('');
      
      await completePreventionAction(actionId);
      
      // Mettre à jour l'action localement
      setActions(prevActions =>
        prevActions.map(action =>
          action.id === actionId
            ? { ...action, completed: true, completed_at: new Date().toISOString() }
            : action
        )
      );
      
      setSuccess('Action marquée comme complétée');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'action');
      console.error(err);
    }
  };

  // Filtrer les actions selon le filtre actif
  const filteredActions = actions.filter(action => {
    if (filter === 'pending') return !action.completed;
    if (filter === 'completed') return action.completed;
    if (filter === 'priority') return action.priority === 'HIGH' || action.priority === 'HAUTE';
    return true; // 'all'
  });

  // Trier les actions : prioritaires en premier, puis par date
  const sortedActions = [...filteredActions].sort((a, b) => {
    // Priorité d'abord
    const priorityOrder = { 'HIGH': 3, 'HAUTE': 3, 'MEDIUM': 2, 'MOYENNE': 2, 'LOW': 1, 'BASSE': 1 };
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Puis par date (plus récentes en premier)
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });

  // Obtenir le texte de la priorité
  const getPriorityText = (priority) => {
    const priorities = {
      'HIGH': 'Haute',
      'HAUTE': 'Haute',
      'MEDIUM': 'Moyenne',
      'MOYENNE': 'Moyenne',
      'LOW': 'Basse',
      'BASSE': 'Basse',
    };
    return priorities[priority] || priority;
  };

  // Obtenir la couleur de la priorité
  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': 'bg-red-100 text-red-800 border-red-200',
      'HAUTE': 'bg-red-100 text-red-800 border-red-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'MOYENNE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'LOW': 'bg-green-100 text-green-800 border-green-200',
      'BASSE': 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Obtenir l'icône selon le type d'action
  const getActionIcon = (actionType) => {
    const icons = {
      'AVOID_ZONE': '🚫',
      'WEAR_MASK': '😷',
      'CHECK_SPO2': '📊',
      'CONSULT_DOCTOR': '👨‍⚕️',
      'STAY_HOME': '🏠',
      'HYDRATE': '💧',
      'REST': '😴',
      'MONITOR_SYMPTOMS': '📈',
      'OTHER': '📋',
    };
    return icons[actionType] || '📋';
  };

  // Obtenir le texte du type d'action
  const getActionTypeText = (actionType) => {
    const types = {
      'AVOID_ZONE': 'Éviter une zone',
      'WEAR_MASK': 'Porter un masque',
      'CHECK_SPO2': 'Vérifier SpO₂',
      'CONSULT_DOCTOR': 'Consulter un médecin',
      'STAY_HOME': 'Rester à domicile',
      'HYDRATE': 'S\'hydrater',
      'REST': 'Se reposer',
      'MONITOR_SYMPTOMS': 'Surveiller les symptômes',
      'OTHER': 'Autre',
    };
    return types[actionType] || actionType;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compter les actions par statut
  const pendingCount = actions.filter(a => !a.completed).length;
  const completedCount = actions.filter(a => a.completed).length;
  const priorityCount = actions.filter(a => a.priority === 'HIGH' || a.priority === 'HAUTE').length;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      {/* HEADER iOS STYLE */}
      <div className="flex justify-between items-end mb-8 animate-in slide-in-from-top duration-700">
        <div>
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Protection</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Prévention</h1>
        </div>
        {pendingCount > 0 && (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[13px] font-bold border border-emerald-200 shadow-sm mb-1">
            {pendingCount} actifs
          </div>
        )}
      </div>

      {/* MESSAGES iOS STYLE */}
      {error && (
        <div className="bg-white/80 backdrop-blur-md border border-red-100 p-4 rounded-2xl mb-6 shadow-sm animate-in zoom-in duration-300">
          <p className="text-xs font-semibold text-red-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            {error}
          </p>
        </div>
      )}
      
      {success && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-10 duration-500">
          <p className="text-sm font-bold flex items-center gap-2 text-emerald-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </p>
        </div>
      )}

      {/* FILTRES iOS STYLE (Segmented Control) */}
      <div className="bg-slate-100/50 p-1 rounded-2xl mb-8 flex gap-1 border border-slate-200/50 overflow-x-auto no-scrollbar">
        {['all', 'pending', 'completed', 'priority'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              flex-1 whitespace-nowrap px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300
              ${filter === f 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-100 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'À faire' : f === 'completed' ? 'Fait' : 'Urgent'}
          </button>
        ))}
      </div>

      {/* LISTE iOS STYLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calcul des protocoles...</p>
        </div>
      ) : sortedActions.length > 0 ? (
        <div className="space-y-4">
          {sortedActions.map((action, index) => (
            <div
              key={action.id}
              className={`
                bg-white rounded-[28px] p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                transition-all duration-500 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-500
                ${action.completed ? 'opacity-60 grayscale-[0.5]' : ''}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-6">
                {/* Icône Design iOS */}
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0
                  ${action.priority === 'HIGH' || action.priority === 'HAUTE' 
                    ? 'bg-red-50 text-red-500' 
                    : 'bg-emerald-50 text-emerald-500'}
                `}>
                  {getActionIcon(action.action_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                      {getActionTypeText(action.action_type)}
                    </h3>
                    <span className={`
                      text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest flex-shrink-0
                      ${action.priority === 'HIGH' || action.priority === 'HAUTE'
                        ? 'text-red-600 bg-red-50 border-red-100'
                        : 'text-emerald-600 bg-emerald-50 border-emerald-100'}
                    `}>
                      {getPriorityText(action.priority)}
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                    {action.recommendation_text || action.text || 'Suivez les instructions médicales de sécurité.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {formatDate(action.created_at)}
                  </span>
                </div>

                {!action.completed ? (
                  <button
                    onClick={() => handleComplete(action.id)}
                    className="bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-[13px] font-bold shadow-lg shadow-slate-200 active:scale-[0.95] transition-transform flex items-center gap-2"
                  >
                    Valider
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[12px]">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Complétée
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-sm animate-in zoom-in duration-700">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Aucune menace</h3>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
            L'air est pur et vos constantes sont stables. Continuez ainsi !
          </p>
        </div>
      )}
    </div>
  );
};

export default PreventionActions;
