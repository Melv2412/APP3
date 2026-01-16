/**
 * Composant NotificationBell
 * Badge de notification avec dropdown pour les alertes
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveAlertsCount, getActiveAlerts } from '../../services/alerts';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [activeCount, setActiveCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAlertsCount = async () => {
      try {
        const count = await getActiveAlertsCount();
        setActiveCount(count);
      } catch (err) {
        console.error('Erreur lors de la récupération du nombre d\'alertes');
      }
    };

    fetchAlertsCount();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchAlertsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchRecentAlerts = async () => {
        try {
          setLoading(true);
          const alerts = await getActiveAlerts();
          const data = Array.isArray(alerts) ? alerts : [];
          setRecentAlerts(data.slice(0, 5)); // Limiter à 5 alertes récentes
        } catch (err) {
          console.error('Erreur lors de la récupération des alertes récentes');
        } finally {
          setLoading(false);
        }
      };
      fetchRecentAlerts();
    }
  }, [isOpen]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPhaseText = (phase) => {
    const phases = {
      'PHASE_1': 'Phase 1',
      'PHASE_2': 'Phase 2',
      'PHASE_3': 'Phase 3'
    };
    return phases[phase] || phase;
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'PHASE_1': 'bg-yellow-100 text-yellow-800',
      'PHASE_2': 'bg-orange-100 text-orange-800',
      'PHASE_3': 'bg-red-100 text-red-800'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-3 hover:bg-primary-green/10 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        aria-label="Notifications"
      >
        <div className="relative">
          <svg
            className={`w-6 h-6 transition-colors duration-300 ${
              activeCount > 0 ? 'text-red-500' : 'text-gray-700 group-hover:text-primary-green'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {/* Badge de notification modernisé */}
          {activeCount > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center">
              <span className="relative w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {activeCount > 9 ? '9+' : activeCount}
                {/* Indicateur de pulse */}
                <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></span>
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Dropdown modernisé */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 z-50 max-h-96 overflow-hidden animate-slide-up">
          {/* Header modernisé */}
          <div className="px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">Alertes Actives</h3>
              </div>
              {activeCount > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full border border-red-200">
                  {activeCount} active{activeCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Liste des alertes modernisée */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center gap-3 px-4 py-3 bg-gray-100/50 rounded-xl">
                  <div className="w-5 h-5 border-2 border-primary-green/30 border-t-primary-green rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Chargement...</span>
                </div>
              </div>
            ) : recentAlerts.length > 0 ? (
              <div className="py-2">
                {recentAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className="px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-blue-50/30 cursor-pointer border-b border-gray-100/50 last:border-b-0 transition-all duration-300 group"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/alerts');
                    }}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(alert.phase)} shadow-sm`}>
                        {getPhaseText(alert.phase)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {formatDate(alert.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800 group-hover:text-primary-green transition-colors">
                          Capteur : {alert.sensor_device_id || alert.sensor}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Cliquez pour voir les détails
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-green group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Aucune alerte active</p>
                    <p className="text-sm text-gray-500 mt-1">Tout est sous contrôle !</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer avec lien modernisé */}
          <div className="px-6 py-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/alerts');
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-green to-dark-green text-white font-semibold rounded-xl hover:from-dark-green hover:to-primary-green transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Voir toutes les alertes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
