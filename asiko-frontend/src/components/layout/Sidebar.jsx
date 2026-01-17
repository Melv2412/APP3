import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertsContext';
import { getActiveAlertsCount } from '../../services/alerts';

/**
 * Sidebar - Version Premium Medical iOS
 * Style: Translucent Slide-Over (Glassmorphism)
 * Animation: Spring physics (Apple style)
 */
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { alerts } = useAlerts();
  const [activeCount, setActiveCount] = useState(0);
  const isDoctor = user?.role === 'DOCTOR';

  // Sync le compteur d'alertes réelles
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getActiveAlertsCount();
        setActiveCount(count);
      } catch (e) { console.warn("Sidebar count sync fail"); }
    };
    fetchCount();
  }, [alerts, isOpen]); // Se met à jour sur nouvelle alerte live OU ouverture menu

  // Empêcher le scroll du body quand le menu est ouvert (UX Mobile Native)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Liste des items de navigation
  const menuItems = [
    ...(user?.role === 'DOCTOR' ? [{ path: '/dashboard/doctor', label: 'Espace Médecin', icon: 'doctor' }] : []),
    { section: 'Principal' },
    { path: '/dashboard', label: 'Accueil', icon: 'home' },
    { path: '/predictions', label: 'Analyse', icon: 'stats' },
    { path: '/sensors', label: 'Capteurs', icon: 'sensor' },
    { section: 'Santé & Suivi' },
    { path: '/alerts', label: 'Alertes', icon: 'bell', badge: activeCount > 0 ? activeCount : null },
    { path: '/actions', label: 'Prévention', icon: 'actions' },
    { path: '/journal', label: 'Mon Carnet', icon: 'journal' },
    { path: '/telemedicine', label: 'Conseil', icon: 'chat' },
    { section: 'Compte' },
    { path: '/map', label: 'Carte Santé', icon: 'map' },
    { path: '/health-profile', label: 'Profil de Santé', icon: 'health' },
    { path: '/profile', label: 'Réglages & Profil', icon: 'profile' },
  ];

  const handleNavigate = (path) => {
    // Petit délai pour laisser voir l'animation de clic
    setTimeout(() => {
      navigate(path);
      onClose();
    }, 150);
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  // Icônes style SF Symbols (Lignes fines, géométrie pure)
  const getIcon = (name, active) => {
    const cls = `w-[22px] h-[22px] transition-colors duration-300 ${active ? (isDoctor ? 'text-indigo-600' : 'text-emerald-600') : 'text-slate-400 group-hover:text-slate-600'}`;
    const stroke = active ? 2.5 : 2; // L'icône active est légèrement plus grasse

    switch (name) {
      case 'home': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
      case 'stats': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'sensor': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
      case 'bell': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
      case 'actions': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'map': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
      case 'journal': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case 'chat': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
      case 'profile': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      case 'health': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'doctor': return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      default: return null;
    }
  };

  return (
    <>
      {/* BACKDROP
        Animation douce d'opacité
      */}
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-[4px] z-[1100] transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* PANEL
        Utilisation de cubic-bezier pour l'effet "Spring" d'iOS
      */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[85%] max-w-[320px] 
          bg-white/85 backdrop-blur-2xl backdrop-saturate-150
          border-r border-white/50 shadow-2xl z-[1200]
          transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full pt-safe-top"> {/* Support encoche iPhone */}

          {/* HEADER: PROFIL UTILISATEUR */}
          <div className="pt-8 pb-6 px-6">
            <div className="flex items-start justify-between mb-6">
              {/* Avatar Large */}
              <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-semibold text-slate-400 border border-slate-200 shadow-sm overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'
                  )}
                </div>
                {/* Indicateur Edit */}
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                  <div className={`w-3 h-3 bg-${isDoctor ? 'indigo' : 'emerald'}-500 rounded-full`}></div>
                </div>
              </div>

              {/* Close Button (Cercle gris comme sur iOS) */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info Typography */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {user?.first_name || 'Bienvenue'}
              </h2>
              <p className="text-sm font-medium text-slate-500">
                {user?.email || 'Patient'}
              </p>
            </div>
          </div>

          {/* SCROLLABLE NAVIGATION */}
          <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
            {menuItems.map((item, index) => {

              // Cas: Séparateur de section
              if (item.section) {
                return (
                  <div key={`section-${index}`} className="mt-6 mb-2 px-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {item.section}
                    </span>
                  </div>
                );
              }

              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full group flex items-center gap-4 px-4 py-3.5 rounded-[16px] text-left relative
                    transition-all duration-200 outline-none
                    ${isActive
                      ? (isDoctor ? 'bg-indigo-50/80 text-indigo-900' : 'bg-emerald-50/80 text-emerald-900')
                      : 'hover:bg-slate-100/50 text-slate-600 active:scale-[0.98]'
                    }
                  `}
                >
                  {/* Icône */}
                  <div className="flex-shrink-0">
                    {getIcon(item.icon, isActive)}
                  </div>

                  {/* Label */}
                  <span className={`flex-1 text-[15px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {item.label}
                  </span>

                  {/* Badge de Notification (Optionnel) */}
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}

                  {/* Chevron indicateur iOS (Subtil) */}
                  <svg
                    className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isActive ? `translate-x-1 ${isDoctor ? 'text-indigo-500' : 'text-emerald-500'}` : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </nav>

          {/* FOOTER: LOGOUT */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-semibold bg-white border border-slate-200 rounded-xl shadow-sm active:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
            <p className="text-center text-[10px] text-slate-300 mt-3">
              AsikoConnect Health v1.0.4
            </p>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;