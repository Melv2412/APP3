/**
 * Service API pour les zones à risque et communauté
 */
import api from './api';

/**
 * Obtenir toutes les zones à risque
 */
export const getRiskZones = async (params = {}) => {
  const response = await api.get('/community/risk-zones/', { params });
  return response.data;
};

/**
 * Obtenir une zone à risque par ID
 */
export const getRiskZoneById = async (id) => {
  const response = await api.get(`/community/risk-zones/${id}/`);
  return response.data;
};

/**
 * Obtenir les zones à risque proches d'un point GPS
 */
export const getNearbyRiskZones = async (latitude, longitude, radius = 10000) => {
  const response = await api.get('/community/risk-zones/nearby/', {
    params: { lat: latitude, lng: longitude, radius },
  });
  return response.data;
};

/**
 * Obtenir la carte des zones à risque (données simplifiées pour affichage)
 */
export const getRiskZonesMap = async () => {
  const response = await api.get('/community/risk-zones/map/');
  return response.data;
};

/**
 * Forcer la mise à jour de toutes les zones à risque
 */
export const updateAllRiskZones = async () => {
  const response = await api.post('/community/risk-zones/update-all/');
  return response.data;
};
