/**
 * Service API de base pour ASIKO
 * Gère les appels HTTP vers le backend Django REST Framework
 */
import axios from 'axios';

const getBaseURL = () => {
  const host = window.location.hostname;
  if (host.includes('devtunnels.ms') || host.includes('github.dev')) {
    // Si on est sur un tunnel, le backend est sur le port 8000 du même tunnel
    return `https://${host.replace('5173', '8000')}/api`;
  }
  return 'https://7znhv71w-8000.uks1.devtunnels.ms/api';
};

const API_BASE_URL = getBaseURL();
// Créer l'instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Nettoyer le token s'il contient déjà "Bearer"
      const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer les erreurs 401 (non authentifié) ou erreurs de token
    if (error.response?.status === 401) {
      // Supprimer le token invalide
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      
      // Améliorer le message d'erreur pour les problèmes de token
      if (error.response?.data?.detail) {
        const errorDetail = error.response.data.detail;
        if (errorDetail.includes('token') || errorDetail.includes('jeton')) {
          error.response.data.detail = 'Session expirée. Veuillez vous reconnecter.';
        }
      }
      
      // Rediriger vers login si pas déjà sur la page login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/register/type') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
