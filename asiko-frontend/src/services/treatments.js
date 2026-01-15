/**
 * Service API pour les actions préventives
 */
import api from './api';

/**
 * Obtenir les actions préventives
 */
export const getPreventionActions = async (params = {}) => {
  const response = await api.get('/treatments/prevention-actions/', { params });
  return response.data;
};

/**
 * Obtenir une action préventive par ID
 */
export const getPreventionActionById = async (id) => {
  const response = await api.get(`/treatments/prevention-actions/${id}/`);
  return response.data;
};

/**
 * Créer une nouvelle action préventive
 */
export const createPreventionAction = async (actionData) => {
  const response = await api.post('/treatments/prevention-actions/', actionData);
  return response.data;
};

/**
 * Marquer une action comme complétée
 */
export const completePreventionAction = async (id) => {
  const response = await api.post(`/treatments/prevention-actions/${id}/complete/`);
  return response.data;
};

/**
 * Obtenir les actions non complétées (pending)
 */
export const getPendingPreventionActions = async () => {
  const response = await api.get('/treatments/prevention-actions/pending/');
  return response.data;
};

/**
 * Obtenir les actions prioritaires
 */
export const getPriorityPreventionActions = async () => {
  const response = await api.get('/treatments/prevention-actions/priority/');
  return response.data;
};

/**
 * Générer des actions préventives pour l'utilisateur connecté
 */
export const generatePreventionActions = async () => {
  const response = await api.post('/treatments/prevention-actions/generate/');
  return response.data;
};
