/**
 * Context API pour l'authentification
 * Gère l'état d'authentification global
 */
import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const token = authService.getToken();
        
        // Vérifier que le token existe et n'est pas vide
        if (currentUser && token && token.trim() !== '') {
          // Vérifier que le token ne contient pas déjà "Bearer"
          const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
          if (cleanToken !== token) {
            // Corriger le token dans localStorage
            localStorage.setItem('token', cleanToken);
          }
          setUser(currentUser);
        } else {
          // Nettoyer si token invalide
          authService.logout();
        }
      } catch (error) {
        // En cas d'erreur, nettoyer
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  /**
   * Connexion
   */
  const login = async (email, password) => {
    try {
      const { user: userData } = await authService.login(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Inscription
   */
  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
