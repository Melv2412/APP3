/**
 * Service API pour les actions préventives
 * (À compléter quand Phase 7 backend sera implémentée)
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
 * Marquer une action comme complétée
 */
export const completePreventionAction = async (id) => {
  const response = await api.post(`/treatments/prevention-actions/${id}/complete/`);
  return response.data;
};
