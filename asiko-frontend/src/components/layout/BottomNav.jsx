import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * BottomNav - Version Premium Medical Health-Tech
 */
const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const isDoctor = user?.role === 'DOCTOR';

  // Animation d'entrée au montage du composant
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const navItems = [
    { path: isDoctor ? '/dashboard/doctor' : '/dashboard', icon: 'home', label: 'Accueil', color: isDoctor ? 'from-indigo-600 to-blue-700' : 'from-emerald-500 to-teal-600' },
    { path: '/predictions', icon: 'stats', label: 'Analyse', color: 'from-blue-500 to-indigo-600' },
    { path: '/sensors', icon: 'sensor', label: 'Capteurs', color: 'from-cyan-500 to-blue-500' },
    { path: '/alerts', icon: 'bell', label: 'Alertes', color: 'from-rose-500 to-red-600' },
    { path: '/telemedicine', icon: 'chat', label: 'Conseil', color: 'from-teal-500 to-emerald-600' },
  ];

  const isActive = (path) => location.pathname === path;

  const getIcon = (iconName, active) => {
    const iconClasses = `w-6 h-6 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-600'
      }`;

    switch (iconName) {
      case 'home':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'stats':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'sensor':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'bell':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case 'chat':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        );
      default: return null;
    }
  };

  return (
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[1050]
      transition-all duration-1000 ease-out transform
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
    `}>
      {/* Conteneur principal Glassmorphism */}
      <nav className="
        relative flex items-center justify-between px-2 py-2
        bg-white/70 backdrop-blur-2xl 
        border border-white/40 rounded-[32px] 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
      ">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center flex-1 py-2 group outline-none"
            >
              {/* Background pill pour l'item actif */}
              {active && (
                <div className={`
                  absolute inset-0 mx-1 my-1 rounded-[24px] 
                  bg-gradient-to-br ${item.color} 
                  shadow-lg shadow-${isDoctor && item.icon === 'home' ? 'indigo' : 'emerald'}-500/20
                  animate-[heartbeat_1.5s_ease-in-out_infinite]
                `} />
              )}

              {/* Icône et Label */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`
                  p-1 transition-transform duration-300
                  ${active ? 'scale-110 mb-0' : 'group-hover:-translate-y-1'}
                `}>
                  {getIcon(item.icon, active)}
                </div>

                <span className={`
                  text-[10px] font-semibold tracking-wide transition-all duration-300
                  ${active ? 'text-white opacity-100' : 'text-slate-400 opacity-80'}
                `}>
                  {item.label}
                </span>
              </div>

              {/* Indicateur point lumineux sous l'icône active */}
              {active && (
                <div className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full blur-[1px]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Styles d'animations personnalisés via injectés via style tag (Tailwind natif ne gère pas le heartbeat complexe par défaut) */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.05); }
          28% { transform: scale(1); }
          42% { transform: scale(1.05); }
          70% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default BottomNav;