/**
 * Composant Header
 * Header principal avec menu hamburger, logo, notifications
 */
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

const Header = ({ onMenuClick, showNotifications = true }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menu hamburger */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo/Titre */}
          <h1
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold text-primary-green cursor-pointer"
          >
            AsikoConnect
          </h1>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {showNotifications && <NotificationBell />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
