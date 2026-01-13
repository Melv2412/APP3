/**
 * Composant ProtectedRoute
 * Protège les routes nécessitant une authentification
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier le rôle si spécifié
  if (requireRole && user?.role !== requireRole) {
    // Rediriger selon le rôle
    if (user?.role === 'PATIENT') {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.role === 'DOCTOR') {
      return <Navigate to="/dashboard/doctor" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
