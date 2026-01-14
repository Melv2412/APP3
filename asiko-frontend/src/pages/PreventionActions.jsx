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
    <div className="min-h-screen bg-gray-50 pb-24 px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Actions Préventives</h1>
        {pendingCount > 0 && (
          <div className="bg-primary-green text-white rounded-full px-3 py-1 text-sm font-semibold">
            {pendingCount} à faire
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            filter === 'all'
              ? 'bg-primary-green text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Toutes ({actions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            filter === 'pending'
              ? 'bg-primary-green text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          À faire ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            filter === 'completed'
              ? 'bg-primary-green text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Complétées ({completedCount})
        </button>
        <button
          onClick={() => setFilter('priority')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            filter === 'priority'
              ? 'bg-primary-green text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Prioritaires ({priorityCount})
        </button>
      </div>

      {/* Liste des actions */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : sortedActions.length > 0 ? (
        <div className="space-y-4">
          {sortedActions.map((action) => (
            <div
              key={action.id}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                action.completed
                  ? 'border-gray-200 opacity-75'
                  : action.priority === 'HIGH' || action.priority === 'HAUTE'
                  ? 'border-red-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Icône */}
                  <div className="text-3xl">{getActionIcon(action.action_type)}</div>
                  
                  <div className="flex-1">
                    {/* Type et priorité */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {getActionTypeText(action.action_type)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                          action.priority
                        )}`}
                      >
                        {getPriorityText(action.priority)}
                      </span>
                      {action.completed && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          ✓ Complétée
                        </span>
                      )}
                    </div>
                    
                    {/* Texte de recommandation */}
                    <p className="text-gray-700 mb-2">{action.recommendation_text || action.text || 'Aucune description'}</p>
                    
                    {/* Date */}
                    <div className="text-xs text-gray-500">
                      Créée le {formatDate(action.created_at)}
                      {action.completed_at && (
                        <span className="ml-2">
                          • Complétée le {formatDate(action.completed_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton d'action */}
              {!action.completed && (
                <button
                  onClick={() => handleComplete(action.id)}
                  className="w-full bg-primary-green text-white font-bold py-2 px-4 rounded-lg hover:bg-dark-green transition-colors text-sm"
                >
                  Marquer comme complétée
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600 mb-2">Aucune action préventive disponible</p>
          <p className="text-sm text-gray-500">
            Les actions préventives seront générées automatiquement en fonction de vos prédictions et alertes.
          </p>
        </div>
      )}
    </div>
  );
};

export default PreventionActions;
