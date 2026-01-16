/**
 * Service API pour le dashboard santé publique (médecin)
 * (À compléter quand Phase 8 backend sera implémentée)
 */
import api from './api';

/**
 * Obtenir les statistiques de santé publique
 */
export const getPublicHealthStats = async () => {
  const response = await api.get('/dashboard/public-health/stats/');
  return response.data;
};

/**
 * Obtenir les zones à risque pour le dashboard
 */
export const getDashboardRiskZones = async () => {
  const response = await api.get('/dashboard/risk-zones/');
  return response.data;
};

/**
 * Obtenir les clusters de risque
 */
export const getClusters = async () => {
  const response = await api.get('/dashboard/clusters/');
  return response.data;
};

/**
 * Obtenir les tendances épidémiologiques
 */
export const getTrends = async () => {
  const response = await api.get('/dashboard/trends/');
  return response.data;
};

/**
 * Obtenir la carte de pollution
 */
export const getPollutionMap = async () => {
  const response = await api.get('/dashboard/pollution-map/');
  return response.data;
};

/**
 * Obtenir le carnet santé agrégé
 * @param {Object} params { date_from, date_to, user_id }
 */
export const getHealthJournal = async (params = {}) => {
  const response = await api.get('/dashboard/health-journal/', { params });
  return response.data;
};

/**
 * Obtenir les établissements de santé à proximité
 * @param {number} latitude - Latitude de l'utilisateur
 * @param {number} longitude - Longitude de l'utilisateur
 * @param {number} radius - Rayon de recherche en km (défaut: 10)
 * @param {string} type - Type d'établissement (HOSPITAL, PNEUMOLOGY_CENTER, etc.)
 */
export const getNearbyFacilities = async (latitude, longitude, radius = 10, type = null) => {
  const params = { lat: latitude, lng: longitude, radius };
  if (type) params.type = type;
  
  const response = await api.get('/community/facilities/nearby/', { params });
  return response.data;
};
