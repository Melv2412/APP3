/**
 * Service API pour les zones à risque et communauté
 * (À compléter quand Phase 6 backend sera implémentée)
 */
import api from './api';

/**
 * Obtenir les zones à risque proches
 */
export const getNearbyRiskZones = async (latitude, longitude, radius = 5000) => {
  const response = await api.get('/community/risk-zones/nearby/', {
    params: { latitude, longitude, radius },
  });
  return response.data;
};

/**
 * Obtenir la carte des zones à risque
 */
export const getRiskMap = async (params = {}) => {
  const response = await api.get('/community/risk-map/', { params });
  return response.data;
};
