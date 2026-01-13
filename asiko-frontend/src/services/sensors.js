/**
 * Service API pour les capteurs et prédictions
 */
import api from './api';

/**
 * Obtenir les mesures de capteurs
 */
export const getSensorMeasurements = async (params = {}) => {
  const response = await api.get('/sensors/measurements/', { params });
  return response.data;
};

/**
 * Obtenir une mesure par ID
 */
export const getSensorMeasurementById = async (id) => {
  const response = await api.get(`/sensors/measurements/${id}/`);
  return response.data;
};

/**
 * Créer une nouvelle mesure de capteur
 */
export const createSensorMeasurement = async (measurementData) => {
  const response = await api.post('/sensors/measurements/', measurementData);
  return response.data;
};

/**
 * Obtenir les prédictions
 */
export const getPredictions = async (params = {}) => {
  const response = await api.get('/sensors/predictions/', { params });
  return response.data;
};

/**
 * Obtenir la dernière prédiction
 */
export const getLatestPrediction = async () => {
  const response = await api.get('/sensors/predictions/latest/');
  return response.data;
};

/**
 * Obtenir l'évolution du risque
 */
export const getRiskEvolution = async () => {
  const response = await api.get('/sensors/risk-evolution/');
  return response.data;
};
