/**
 * Page Données Capteurs
 * Affiche les mesures IoT et leurs évolutions
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSensorMeasurements, getLatestMeasurement } from '../services/sensors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Sensors = () => {
  const { user } = useAuth();
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        setLoading(true);
        
        // Récupérer la dernière mesure
        try {
          const latest = await getLatestMeasurement();
          setLatestMeasurement(latest);
        } catch (err) {
          console.log('Aucune mesure disponible');
        }

        // Récupérer les dernières mesures (dernières 10)
        try {
          const response = await getSensorMeasurements({ ordering: '-created_at' });
          const data = response.results || response || [];
          setMeasurements(data.slice(0, 10)); // Limiter à 10 pour l'affichage
        } catch (err) {
          console.log('Erreur lors de la récupération des mesures');
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, []);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir le statut d'une valeur
  const getStatusColor = (value, type) => {
    if (type === 'spo2') {
      if (value >= 95) return 'text-green-600';
      if (value >= 90) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'temperature') {
      if (value >= 36.1 && value <= 37.2) return 'text-green-600';
      if (value >= 35.5 && value <= 38.5) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Données Capteurs</h1>

      {/* Section Mesures Actuelles */}
      {latestMeasurement && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Dernière Mesure</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* SpO₂ */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">SpO₂</div>
              <div className={`text-2xl font-bold ${getStatusColor(latestMeasurement.spo2, 'spo2')}`}>
                {latestMeasurement.spo2.toFixed(1)}%
              </div>
            </div>

            {/* Température */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Température</div>
              <div className={`text-2xl font-bold ${getStatusColor(latestMeasurement.temperature, 'temperature')}`}>
                {latestMeasurement.temperature.toFixed(1)}°C
              </div>
            </div>

            {/* Rythme Respiratoire */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Rythme Respiratoire</div>
              <div className="text-2xl font-bold text-gray-800">
                {latestMeasurement.respiratory_rate.toFixed(1)}/min
              </div>
            </div>

            {/* Fréquence Cardiaque */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Fréquence Cardiaque</div>
              <div className="text-2xl font-bold text-gray-800">
                {latestMeasurement.heart_rate.toFixed(0)} bpm
              </div>
            </div>

            {/* Tension Artérielle */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Tension Artérielle</div>
              <div className="text-2xl font-bold text-gray-800">
                {latestMeasurement.systolic_bp.toFixed(0)} mmHg
              </div>
            </div>

            {/* WBC */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">WBC</div>
              <div className="text-2xl font-bold text-gray-800">
                {latestMeasurement.wbc.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Mesuré le {formatDate(latestMeasurement.created_at)}
            </div>
          </div>
        </div>
      )}

      {/* Section Historique */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historique des Mesures</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : measurements.length > 0 ? (
          <div className="space-y-3">
            {measurements.map((measurement) => (
              <div
                key={measurement.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-gray-800">
                    {formatDate(measurement.created_at)}
                  </div>
                  <div className="text-xs text-gray-500">CURB-65: {measurement.curb65}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">SpO₂: </span>
                    <span className="font-semibold">{measurement.spo2.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Temp: </span>
                    <span className="font-semibold">{measurement.temperature.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-gray-600">RR: </span>
                    <span className="font-semibold">{measurement.respiratory_rate.toFixed(1)}/min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucune mesure disponible
          </div>
        )}
      </div>

      {/* Section Tendances */}
      {latestMeasurement && (latestMeasurement.rr_trend !== 0 || latestMeasurement.spo2_trend !== 0) && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tendances</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rythme Respiratoire</span>
              <span className={`font-semibold ${latestMeasurement.rr_trend > 0 ? 'text-red-600' : latestMeasurement.rr_trend < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {latestMeasurement.rr_trend > 0 ? '↗ Augmentation' : latestMeasurement.rr_trend < 0 ? '↘ Diminution' : '→ Stable'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">SpO₂</span>
              <span className={`font-semibold ${latestMeasurement.spo2_trend > 0 ? 'text-green-600' : latestMeasurement.spo2_trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {latestMeasurement.spo2_trend > 0 ? '↗ Amélioration' : latestMeasurement.spo2_trend < 0 ? '↘ Dégradation' : '→ Stable'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Sensors;
