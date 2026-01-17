import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Version Sécurisée & Premium
 * Assure la protection des données médicales avec une UX fluide.
 * Comprend un loader style "Apple Health" et une gestion de redirection intelligente.
 */
const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 1. ÉTAT DE CHARGEMENT (Style iOS Splash Screen)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          {/* Spinner iOS Custom avec Tailwind */}
          <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>

          {/* Logo subtil en fond */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <p className="mt-6 text-sm font-medium text-slate-400 tracking-wide uppercase">
          Sécurisation de la session...
        </p>
      </div>
    );
  }

  // 2. NON AUTHENTIFIÉ
  // On sauvegarde la destination pour y retourner après le login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. VÉRIFICATION DES DROITS D'ACCÈS (Rôles)
  if (requireRole && user?.role !== requireRole) {
    console.warn(`[Access Denied] Restricted to ${requireRole}. User role: ${user?.role}`);

    // Redirection intelligente vers l'espace approprié
    const fallbackPath = user?.role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  // 4. ACCÈS AUTORISÉ
  // On enveloppe dans une div d'animation pour une transition fluide à l'affichage
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
      {children}
    </div>
  );
};

export default ProtectedRoute;