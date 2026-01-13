/**
 * Service API pour les profils de santé
 */
import api from './api';

/**
 * Obtenir le profil de santé de l'utilisateur connecté
 */
export const getHealthProfile = async () => {
  const response = await api.get('/health-profiles/');
  return response.data;
};

/**
 * Obtenir un profil de santé par ID
 */
export const getHealthProfileById = async (id) => {
  const response = await api.get(`/health-profiles/${id}/`);
  return response.data;
};

/**
 * Créer un profil de santé
 */
export const createHealthProfile = async (profileData) => {
  const response = await api.post('/health-profiles/', profileData);
  return response.data;
};

/**
 * Mettre à jour un profil de santé
 */
export const updateHealthProfile = async (id, profileData) => {
  const response = await api.patch(`/health-profiles/${id}/`, profileData);
  return response.data;
};

/**
 * Obtenir l'indice de vulnérabilité
 */
export const getVulnerabilityIndex = async (id) => {
  const response = await api.get(`/health-profiles/${id}/vulnerability-index/`);
  return response.data;
};

/**
 * Recalculer l'indice de vulnérabilité
 */
export const recalculateVulnerability = async (id) => {
  const response = await api.post(`/health-profiles/${id}/recalculate-vulnerability/`);
  return response.data;
};

/**
 * Obtenir la liste des comorbidités
 */
export const getComorbidities = async () => {
  const response = await api.get('/comorbidities/');
  return response.data;
};

/**
 * Obtenir la liste des statuts vaccinaux
 */
export const getVaccinationStatuses = async () => {
  const response = await api.get('/vaccination-statuses/');
  return response.data;
};
