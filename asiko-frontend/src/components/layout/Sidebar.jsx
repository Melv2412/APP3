/**
 * Composant Sidebar
 * Menu latéral qui s'ouvre depuis le menu hamburger
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    ...(user?.role === 'DOCTOR'
      ? [{ path: '/dashboard/doctor', label: 'Dashboard Médecin', icon: 'stats' }]
      : []),
    { path: '/dashboard', label: 'Accueil', icon: 'home' },
    { path: '/predictions', label: 'Prédictions', icon: 'stats' },
    { path: '/sensors', label: 'Capteurs', icon: 'sensor' },
    { path: '/alerts', label: 'Alertes', icon: 'bell' },
    { path: '/actions', label: 'Actions Préventives', icon: 'actions' },
    { path: '/map', label: 'Carte', icon: 'map' },
    { path: '/health-profile', label: 'Profil de Santé', icon: 'health' },
    { path: '/journal', label: 'Carnet Santé', icon: 'journal' },
    { path: '/telemedicine', label: 'Conseil Médical', icon: 'chat' },
    { path: '/profile', label: 'Profil', icon: 'profile' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const getIcon = (iconName) => {
    const iconClasses = 'w-5 h-5';
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case 'bell':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case 'actions':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'map':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case 'profile':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'health':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'journal':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14a2 2 0 002 2h10M5 5a2 2 0 012-2h8a2 2 0 012 2v12M5 5h14M9 9h6M9 13h4" />
          </svg>
        );
      case 'chat':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay modernisé avec animation */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar modernisé */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-100/50 z-50 transform transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0 scale-100' : '-translate-x-full scale-95'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header modernisé */}
          <div className="bg-gradient-to-r from-primary-green via-dark-green to-primary-green text-white px-6 py-6 relative overflow-hidden">
            {/* Fond décoratif */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Menu</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm"
                aria-label="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* User info modernisé */}
          <div className="px-6 py-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-green to-dark-green rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-lg truncate">
                  {user?.first_name || user?.username || 'Utilisateur'}
                </p>
                <p className="text-sm text-gray-600 truncate">{user?.email || ''}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 font-medium">Connecté</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu items modernisés */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full group flex items-center gap-4 px-4 py-4 text-left rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-green/10 to-dark-green/10 text-primary-green font-semibold shadow-lg border border-primary-green/20'
                        : 'text-gray-700 hover:bg-gray-100/70 hover:text-gray-900'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Indicateur actif */}
                    {isActive && (
                      <div className="w-1 h-8 bg-gradient-to-b from-primary-green to-dark-green rounded-full"></div>
                    )}

                    {/* Icône avec animation */}
                    <div className={`transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      {getIcon(item.icon)}
                    </div>

                    {/* Label */}
                    <span className="flex-1 font-medium">{item.label}</span>

                    {/* Flèche pour l'élément actif */}
                    {isActive && (
                      <svg className="w-4 h-4 text-primary-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout button modernisé */}
          <div className="border-t border-gray-100/50 p-6 bg-gradient-to-r from-red-50/30 to-orange-50/30">
            <button
              onClick={handleLogout}
              className="w-full group flex items-center gap-4 px-4 py-4 text-left text-red-600 hover:bg-red-50/70 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="w-10 h-10 bg-red-100/70 rounded-xl flex items-center justify-center group-hover:bg-red-200/70 transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <span className="font-semibold block">Déconnexion</span>
                <span className="text-xs text-red-500">Fermer la session</span>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
