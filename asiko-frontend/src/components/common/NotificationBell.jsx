import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveAlertsCount, getActiveAlerts } from '../../services/alerts';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [activeCount, setActiveCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Logique de synchronisation optimisée
  const refreshData = useCallback(async () => {
    try {
      const count = await getActiveAlertsCount();
      setActiveCount(count);
      if (isOpen) {
        setLoading(true);
        const alerts = await getActiveAlerts();
        setRecentAlerts(Array.isArray(alerts) ? alerts.slice(0, 5) : []);
        setLoading(false);
      }
    } catch (err) {
      console.error("Sync failed");
    }
  }, [isOpen]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 15000); // Rafraîchissement dynamique
    return () => clearInterval(interval);
  }, [refreshData]);

  // 2. Styles sémantiques iOS
  const getStatusConfig = (phase) => {
    const configs = {
      'PHASE_3': { color: 'bg-red-500', label: 'Critique', pulse: 'bg-red-400' },
      'PHASE_2': { color: 'bg-orange-500', label: 'Urgent', pulse: 'bg-orange-400' },
      'PHASE_1': { color: 'bg-amber-500', label: 'Attention', pulse: 'bg-amber-400' }
    };
    return configs[phase] || { color: 'bg-slate-400', label: 'Info', pulse: 'bg-slate-300' };
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* TRIGGER : Bouton à retour haptique visuel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-all duration-500 active:scale-90 ${isOpen ? 'bg-slate-100 shadow-inner' : 'hover:bg-slate-50'
          }`}
      >
        <svg
          className={`w-6 h-6 transition-all duration-500 ${activeCount > 0 ? 'text-slate-900 scale-110' : 'text-slate-400'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>

        {activeCount > 0 && (
          <span className="absolute top-2 right-2.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
          </span>
        )}
      </button>

      {/* DROPDOWN : Design "Glassmorphism" Dynamique */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-[340px] sm:w-[380px] bg-white/80 backdrop-blur-2xl rounded-[28px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-white/50 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">

          {/* Header minimaliste */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100/50">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Activités</h3>
            <span className="text-[12px] font-bold px-2.5 py-1 bg-slate-900 text-white rounded-full">
              {activeCount}
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden py-2 px-3">
            {loading ? (
              <div className="flex flex-col items-center py-12 space-y-4">
                <div className="w-6 h-6 border-[3px] border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Analyse en cours</span>
              </div>
            ) : recentAlerts.length > 0 ? (
              recentAlerts.map((alert, idx) => {
                const config = getStatusConfig(alert.phase);
                return (
                  <div
                    key={alert.id}
                    onClick={() => { navigate('/alerts'); setIsOpen(false); }}
                    className="group relative flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 hover:bg-white active:scale-[0.97] cursor-pointer"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Indicateur visuel gauche */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 ${config.color} bg-opacity-10 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${config.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                      </div>
                    </div>

                    {/* Contenu textuel */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${config.color.replace('bg-', 'text-')}`}>
                          {config.label}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-bold text-slate-800 mt-0.5 truncate uppercase">
                        {alert.sensor_device_id || 'Système'}
                      </h4>
                      <p className="text-[13px] text-slate-500 leading-snug mt-0.5 line-clamp-1">
                        Anomalie détectée • Nécessite votre attention
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-900">Zone Optimale</p>
                <p className="text-sm text-slate-400">Aucune alerte pour le moment.</p>
              </div>
            )}
          </div>

          {/* Footer - Bouton Action Massive */}
          <div className="p-4 bg-slate-50/50 backdrop-blur-sm border-t border-slate-100">
            <button
              onClick={() => { navigate('/alerts'); setIsOpen(false); }}
              className="w-full group flex items-center justify-between px-5 py-4 bg-white border border-slate-200 rounded-[20px] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-[15px] font-bold text-slate-900">Historique complet</span>
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:translate-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;