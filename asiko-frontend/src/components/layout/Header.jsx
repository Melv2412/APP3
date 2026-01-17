import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

/**
 * Header - Version Premium Medical iOS
 * Style: Clean, Clinical, Trustworthy
 * Features: Frosted glass, micro-interactions, squircle shapes
 */
const Header = ({ onMenuClick, showNotifications = true }) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Détection du scroll pour ajuster l'opacité/ombre
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-40 w-full transition-all duration-500 ease-in-out
        ${scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-sm border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60'
          : 'bg-white/50 backdrop-blur-lg border-b border-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* GAUCHE: Menu & Logo */}
          <div className="flex items-center gap-4">

            {/* Bouton Menu (Hamburger Modernisé) */}
            <button
              onClick={onMenuClick}
              className="group relative p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 focus:outline-none active:scale-95"
              aria-label="Menu Principal"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-[5px]">
                <span className="w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 group-hover:w-6 group-hover:bg-emerald-600"></span>
                <span className="w-3 h-0.5 bg-slate-700 rounded-full transition-all duration-300 group-hover:w-6 group-hover:bg-emerald-600 ml-auto group-hover:ml-0"></span>
                <span className="w-6 h-0.5 bg-slate-700 rounded-full transition-all duration-300 group-hover:bg-emerald-600"></span>
              </div>
            </button>

            {/* Identité de marque (Brand) */}
            <div
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Logo Icon - Style "App Icon" iOS */}
              <div className="relative w-9 h-9 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[10px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  {/* Croix médicale stylisée / Coeur */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>

              {/* Texte Logo - Typographie Pro */}
              <div className="flex flex-col justify-center -space-y-0.5">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none group-hover:text-emerald-700 transition-colors duration-300">
                  Asiko<span className="font-normal text-slate-600">Connect</span>
                </h1>
                <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider hidden sm:block">
                  Santé Connectée
                </span>
              </div>
            </div>
          </div>

          {/* DROITE: Actions & Profil */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Notifications */}
            {showNotifications && (
              <div className="relative transform hover:scale-105 transition-transform duration-200">
                <NotificationBell />
              </div>
            )}

            {/* Séparateur vertical (Desktop uniquement) */}
            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

            {/* Avatar / Profil (Miniature) */}
            <button
              onClick={() => navigate('/profile')}
              className="relative p-0.5 rounded-full border border-slate-200 hover:border-emerald-300 transition-all duration-300 active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {/* Fallback avatar SVG si pas d'image */}
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {/* <img src={userAvatarUrl} alt="Profil" className="w-full h-full object-cover" /> */}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;