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
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-gray-700"
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
        {activeCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Alertes</h3>
            {activeCount > 0 && (
              <span className="text-sm text-gray-600">{activeCount} active{activeCount > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Liste des alertes */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">Chargement...</div>
            ) : recentAlerts.length > 0 ? (
              <div className="py-2">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/alerts');
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPhaseColor(alert.phase)}`}>
                        {getPhaseText(alert.phase)}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(alert.created_at)}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Capteur : {alert.sensor_device_id || alert.sensor}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                Aucune alerte active
              </div>
            )}
          </div>

          {/* Footer avec lien */}
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/alerts');
              }}
              className="w-full text-center text-primary-green font-semibold hover:underline text-sm"
            >
              Voir toutes les alertes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
