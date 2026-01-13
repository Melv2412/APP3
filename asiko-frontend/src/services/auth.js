/**
 * Service d'authentification
 * Gère login, register, logout
 */
import api from './api';

/**
 * Connexion utilisateur
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} Token JWT et données utilisateur
 */
export const login = async (username, password) => {
  const response = await api.post('/auth/login/', {
    username,
    password,
  });
  
  const { tokens, user } = response.data;
  const { access, refresh } = tokens;
  
  // Stocker le token et l'utilisateur
  localStorage.setItem('token', access);
  localStorage.setItem('refresh', refresh);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { access, refresh, user };
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
