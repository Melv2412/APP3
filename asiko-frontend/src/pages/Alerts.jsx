/**
 * Page Alertes
 * Affiche les alertes actives et permet de les gérer
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveAlerts, getAlerts, deactivateAlert, getActiveAlertsCount } from '../services/alerts';

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active'); // active, all

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError('');

        // Récupérer le nombre d'alertes actives
        try {
          const count = await getActiveAlertsCount();
          setActiveAlertsCount(count);
        } catch (err) {
          console.log('Erreur lors de la récupération du nombre d\'alertes');
        }

        // Récupérer les alertes selon le filtre
        if (filter === 'active') {
          const activeAlerts = await getActiveAlerts();
          setAlerts(Array.isArray(activeAlerts) ? activeAlerts : []);
        } else {
          const allAlerts = await getAlerts({ ordering: '-created_at' });
          const data = allAlerts.results || allAlerts || [];
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError('Erreur lors du chargement des alertes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filter]);

  const handleDeactivate = async (alertId) => {
    try {
      await deactivateAlert(alertId);
      // Rafraîchir la liste
      if (filter === 'active') {
        const activeAlerts = await getActiveAlerts();
        setAlerts(Array.isArray(activeAlerts) ? activeAlerts : []);
        const count = await getActiveAlertsCount();
        setActiveAlertsCount(count);
      } else {
        const allAlerts = await getAlerts({ ordering: '-created_at' });
        const data = allAlerts.results || allAlerts || [];
        setAlerts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Erreur lors de la désactivation de l\'alerte');
      console.error(err);
    }
  };

  // Fonction pour obtenir le texte de la phase
  const getPhaseText = (phase) => {
    const phases = {
      'PHASE_1': 'Phase 1',
      'PHASE_2': 'Phase 2',
      'PHASE_3': 'Phase 3'
    };
    return phases[phase] || phase;
  };

  // Fonction pour obtenir la couleur de la phase
  const getPhaseColor = (phase) => {
    const colors = {
      'PHASE_1': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PHASE_2': 'bg-orange-100 text-orange-800 border-orange-200',
      'PHASE_3': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Fonction pour formater la date
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24 px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Alertes</h1>
        {activeAlertsCount > 0 && (
          <div className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
            {activeAlertsCount} active{activeAlertsCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            filter === 'active'
              ? 'bg-primary-green text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Actives ({activeAlertsCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            filter === 'all'
              ? 'bg-primary-green text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Toutes
        </button>
      </div>

      {/* Liste des alertes */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Chargement...</div>
      ) : alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                alert.is_active ? 'border-red-200' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPhaseColor(
                        alert.phase
                      )}`}
                    >
                      {getPhaseText(alert.phase)}
                    </span>
                    {alert.is_active ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Capteur : {alert.sensor_device_id || alert.sensor}
                  </div>
                  <div className="text-xs text-gray-500">
                    Créée le {formatDate(alert.created_at)}
                  </div>
                  {alert.phase_1_started_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Phase 1 démarrée : {formatDate(alert.phase_1_started_at)}
                    </div>
                  )}
                  {alert.phase_2_started_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Phase 2 démarrée : {formatDate(alert.phase_2_started_at)}
                    </div>
                  )}
                  {alert.phase_3_started_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Phase 3 démarrée : {formatDate(alert.phase_3_started_at)}
                    </div>
                  )}
                </div>
              </div>

              {alert.is_active && (
                <button
                  onClick={() => handleDeactivate(alert.id)}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                >
                  Désactiver l'alerte
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600">Aucune alerte disponible</p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default Alerts;
