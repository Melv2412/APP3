/**
 * Composant Header
 * Header principal avec menu hamburger, logo, notifications - Design moderne
 */
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

const Header = ({ onMenuClick, showNotifications = true }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Menu hamburger modernisé */}
          <button
            onClick={onMenuClick}
            className="group relative p-3 hover:bg-primary-green/10 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            aria-label="Menu"
          >
            <div className="relative w-6 h-6">
              <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-700 transform transition-all duration-300 group-hover:bg-primary-green"></span>
              <span className="absolute top-2 left-0 w-full h-0.5 bg-gray-700 transform transition-all duration-300 group-hover:bg-primary-green"></span>
              <span className="absolute top-4 left-0 w-full h-0.5 bg-gray-700 transform transition-all duration-300 group-hover:bg-primary-green"></span>
            </div>
          </button>

          {/* Logo/Titre modernisé */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group transform hover:scale-105 transition-all duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-dark-green rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-green to-dark-green bg-clip-text text-transparent group-hover:from-dark-green group-hover:to-primary-green transition-all duration-300">
              AsikoConnect
            </h1>
          </div>

          {/* Actions droite modernisées */}
          <div className="flex items-center gap-3">
            {/* Notifications avec effet moderne */}
            {showNotifications && (
              <div className="relative">
                <NotificationBell />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ligne décorative subtile */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-green/20 to-transparent"></div>
    </header>
  );
};

export default Header;
