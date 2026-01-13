/**
 * Service API pour les alertes
 * (À compléter quand Phase 5 backend sera implémentée)
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
 * Obtenir une alerte par ID
 */
export const getAlertById = async (id) => {
  const response = await api.get(`/alerts/${id}/`);
  return response.data;
};

/**
 * Marquer une alerte comme lue
 */
export const markAlertAsRead = async (id) => {
  const response = await api.patch(`/alerts/${id}/mark-read/`);
  return response.data;
};

/**
 * Obtenir le nombre d'alertes non lues
 */
export const getUnreadAlertsCount = async () => {
  const response = await api.get('/alerts/unread-count/');
  return response.data;
};
