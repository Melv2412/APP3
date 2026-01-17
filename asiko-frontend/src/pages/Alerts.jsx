import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveAlerts, getAlerts, deactivateAlert, getActiveAlertsCount } from '../services/alerts';
<<<<<<< Updated upstream
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
=======
import { useAlerts } from "../context/AlertsContext";

>>>>>>> Stashed changes

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const [filter, setFilter] = useState('active');
=======
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active'); // active, all
  const { alerts: liveAlerts } = useAlerts();

>>>>>>> Stashed changes

  // Logique strictement identique
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const count = await getActiveAlertsCount();
        setActiveAlertsCount(count);
        if (filter === 'active') {
          const active = await getActiveAlerts();
          setAlerts(Array.isArray(active) ? active : []);
        } else {
          const all = await getAlerts({ ordering: '-created_at' });
          setAlerts(Array.isArray(all.results || all) ? (all.results || all) : []);
        }
      } finally { setLoading(false); }
    };
    fetchAlerts();
  }, [filter]);

<<<<<<< Updated upstream
=======


  useEffect(() => {
    if (liveAlerts.length === 0) return;

    const latest = liveAlerts[0];

    // Optionnel : toast
    console.log("Nouvelle alerte SSE :", latest.message);

    // Rafraîchir la liste REST
    const refresh = async () => {
      try {
        const count = await getActiveAlertsCount();
        setActiveAlertsCount(count);

        if (filter === "active") {
          const activeAlerts = await getActiveAlerts();
          setAlerts(Array.isArray(activeAlerts) ? activeAlerts : []);
        } else {
          const allAlerts = await getAlerts({ ordering: "-created_at" });
          const data = allAlerts.results || allAlerts || [];
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.warn("Refresh après SSE échoué");
      }
    };

    refresh();
  }, [liveAlerts]);


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

>>>>>>> Stashed changes
  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-32">
      {/* Header Immersif */}
      <div className="sticky top-0 z-50 bg-[#FBFBFD]/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-tight text-gray-900">Alertes</h1>

<<<<<<< Updated upstream
          {/* Segmented Control Réaliste */}
          <div className="flex bg-gray-200/50 p-1 rounded-xl w-[220px]">
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 text-[13px] font-bold py-1.5 rounded-lg transition-all ${filter === 'active' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
=======
      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${filter === 'active'
            ? 'bg-primary-green text-white'
            : 'bg-gray-100 text-gray-600'
            }`}
        >
          Actives ({activeAlertsCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${filter === 'all'
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
              className={`bg-white rounded-lg shadow-sm p-6 border-2 ${alert.is_active ? 'border-red-200' : 'border-gray-200'
>>>>>>> Stashed changes
                }`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 text-[13px] font-bold py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
            >
              Historique
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-8">

            {/* Section dynamique selon le filtre */}
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <div key={alert.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  {filter === 'active' ? (
                    /* Vue ACTIVE : Carte de relief */
                    <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge variant={alert.phase === 'PHASE_3' ? 'danger' : 'warning'} dot size="sm">
                            {alert.phase.replace('_', ' ')}
                          </Badge>
                          <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-tight">
                            {alert.sensor_device_id || "Capteur sans nom"}
                          </h2>
                          <p className="text-[14px] text-gray-500 font-medium">
                            Détecté à {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center">
                          <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                        <span className="text-[14px] font-semibold text-gray-600 italic">Action requise immédiatement</span>
                        <Button
                          variant="primary"
                          size="sm"
                          className="!rounded-xl !bg-gray-900 !px-5"
                          onClick={() => {/* handleDeactivate */ }}
                        >
                          Régler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Vue HISTORIQUE : Liste de lignes épurée */
                    <div className={`flex items-center justify-between py-4 group border-b border-gray-100`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${alert.is_active ? 'bg-red-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {alert.sensor_device_id || 'Système'}
                          </p>
                          <p className="text-[13px] text-gray-400 font-medium">
                            {new Date(alert.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-gray-900">
                          {alert.phase === 'PHASE_3' ? 'Critique' : 'Standard'}
                        </p>
                        <p className="text-[12px] text-gray-400 font-medium uppercase tracking-tighter">Terminé</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* State Vide Réaliste */
          <div className="flex flex-col items-center justify-center py-32 opacity-40">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[17px] font-bold text-gray-900">Rien à signaler</p>
            <p className="text-[14px] text-gray-500 font-medium">Votre environnement est stable.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;