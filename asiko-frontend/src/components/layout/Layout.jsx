import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

/**
 * Layout - Architecture "Medical App Shell"
 * Structure responsive qui imite le comportement natif iOS
 * Gère le scroll, les zones de sécurité (safe-areas) et le centrage sur Desktop
 */
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';

  // Scroll to top automatique lors du changement de page (comportement natif)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className={`relative min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-${isDoctor ? 'indigo' : 'emerald'}-100 selection:text-${isDoctor ? 'indigo' : 'emerald'}-900`}>

      {/* --- FOND D'AMBIANCE (Fixed) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Lumière principale en haut à gauche */}
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-${isDoctor ? 'indigo' : 'emerald'}-50/60 to-transparent rounded-full blur-[120px]`} />
        {/* Contre-lumière douce en bas à droite */}
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-${isDoctor ? 'blue' : 'emerald'}-50/50 to-transparent rounded-full blur-[100px]`} />
        {/* Texture subtile de bruit */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- STRUCTURE PRINCIPALE --- */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Header (Sticky top) */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          showNotifications={true}
        />

        {/* Sidebar (Overlay) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* --- CONTENU DE LA PAGE --- 
            max-w-3xl : Sur grand écran, on centre le contenu pour garder l'aspect app
            px-4 : Marges latérales de sécurité
            pb-32 : Espace vital pour ne pas que la BottomNav cache le contenu
        */}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))] animate-in fade-in duration-500">
          <Outlet />
        </main>

        {/* Bottom Navigation (Mobile Only - géré par le composant lui-même) */}
        <BottomNav />

      </div>
    </div>
  );
};

export default Layout;