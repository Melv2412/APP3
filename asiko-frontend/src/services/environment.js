/**
 * Service API pour les données environnementales
 */
import api from './api';

/**
 * Obtenir les données environnementales
 */
export const getEnvironmentData = async (params = {}) => {
  const response = await api.get('/environment/', { params });
  return response.data;
};

/**
 * Obtenir les données environnementales actuelles pour une position
 */
export const getCurrentEnvironmentData = async (latitude, longitude) => {
  const response = await api.get(`/environment/current/${latitude}/${longitude}/`);
  return response.data;
};

/**
 * Obtenir les données environnementales proches
 */
export const getNearbyEnvironmentData = async (latitude, longitude, radius = 5000) => {
  const response = await api.get('/environment/nearby/', {
    params: { latitude, longitude, radius },
  });
  return response.data;
};

/**
 * Créer une donnée environnementale
 */
export const createEnvironmentData = async (data) => {
  const response = await api.post('/environment/', data);
  return response.data;
};
