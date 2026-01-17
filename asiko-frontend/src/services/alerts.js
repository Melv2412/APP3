/**
 * Service API pour les alertes
 */
import api from './api';




/**
 * Obtenir les alertes
 */
export const getAlerts = async (params = {}) => {
  const response = await api.get('/alerts/', { params });
  return response.data;
};

/**
 * Obtenir les alertes actives
 */
export const getActiveAlerts = async () => {
  const response = await api.get('/alerts/active/');
  return response.data;
};

/**
 * Obtenir une alerte par ID
 */
export const getAlertById = async (id) => {
  const response = await api.get(`/alerts/${id}/`);
  return response.data;
};

/**
 * Désactiver une alerte
 */
export const deactivateAlert = async (id) => {
  const response = await api.patch(`/alerts/${id}/deactivate/`);
  return response.data;
};

/**
 * Obtenir le nombre d'alertes actives
 */
export const getActiveAlertsCount = async () => {
  const response = await api.get('/alerts/active-count/');
  return response.data.count || 0;
};
