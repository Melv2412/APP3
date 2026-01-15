/**
 * Service d'authentification
 * Gère login, register, logout
 */
import api from './api';

/**
 * Connexion utilisateur
 * @param {string} username - Username ou email (le backend accepte l'email comme username)
 * @param {string} password 
 * @returns {Promise} Token JWT et données utilisateur
 */
export const login = async (username, password) => {
  try {
    // Nettoyer les anciens tokens avant de se connecter
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    const response = await api.post('/auth/login/', {
      username,
      password,
    });
    
    // Vérifier que la réponse contient bien les tokens
    if (!response.data || !response.data.tokens) {
      throw new Error('Format de réponse invalide du serveur');
    }
    
    const { tokens, user } = response.data;
    
    if (!tokens || !tokens.access || !tokens.refresh) {
      throw new Error('Tokens manquants dans la réponse');
    }
    
    const { access, refresh } = tokens;
    
    // Vérifier que les tokens sont valides (non vides)
    if (!access || !refresh) {
      throw new Error('Tokens invalides reçus du serveur');
    }
    
    // Stocker le token et l'utilisateur
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { access, refresh, user };
  } catch (error) {
    // Nettoyer en cas d'erreur
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    // Propager l'erreur avec un message plus clair
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Erreur de connexion. Veuillez réessayer.');
    }
  }
};

/**
 * Inscription utilisateur
 * @param {Object} userData - Données utilisateur (email, password, role, etc.)
 * @returns {Promise} Données utilisateur créé
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  
  // Si l'inscription retourne un token, le stocker
  if (response.data.tokens) {
    const { access, refresh } = response.data.tokens;
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Déconnexion utilisateur
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
};

/**
 * Obtenir l'utilisateur actuel
 * @returns {Object|null} Données utilisateur ou null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Vérifier si l'utilisateur est authentifié
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Obtenir le token JWT
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token');
};
