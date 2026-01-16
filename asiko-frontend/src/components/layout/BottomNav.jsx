/**
 * Composant BottomNav
 * Navigation mobile en bas d'écran - Design moderne
 */
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Accueil', color: 'from-primary-green to-dark-green' },
    { path: '/predictions', icon: 'stats', label: 'Prédictions', color: 'from-blue-500 to-blue-600' },
    { path: '/sensors', icon: 'sensor', label: 'Capteurs', color: 'from-purple-500 to-purple-600' },
    { path: '/alerts', icon: 'bell', label: 'Alertes', color: 'from-red-500 to-red-600' },
    { path: '/telemedicine', icon: 'chat', label: 'Conseil', color: 'from-green-500 to-green-600' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getIcon = (iconName, isActive) => {
    const iconClasses = `w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`;

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl z-50">
      <div className="container mx-auto px-2">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 group ${
                  active
                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-110`
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                aria-label={item.label}
              >
                {/* Indicateur actif avec animation */}
                {active && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-gray-200 animate-pulse">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                  </div>
                )}

                {/* Icône avec animation */}
                <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {getIcon(item.icon, active)}
                </div>

                {/* Label avec animation */}
                <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                  active ? 'text-white' : 'group-hover:text-gray-900'
                }`}>
                  {item.label}
                </span>

                {/* Effet de brillance pour l'élément actif */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-2xl opacity-50"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ligne décorative subtile */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-green/20 to-transparent"></div>
    </nav>
  );
};

export default BottomNav;
