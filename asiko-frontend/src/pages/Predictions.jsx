/**
 * Page Prédictions IA
 * Affiche les prédictions de pneumonie avec probabilité et historique
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLatestPrediction, getPredictions } from '../services/sensors';

const Predictions = () => {
  const { user } = useAuth();
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('week'); // week, month, year

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        
        // Récupérer la dernière prédiction
        try {
          const latest = await getLatestPrediction();
          setLatestPrediction(latest);
        } catch (err) {
          console.log('Aucune prédiction disponible');
        }

        // Récupérer l'historique des prédictions
        try {
          const params = {};
          // Calculer date_from selon le filtre
          const now = new Date();
          if (filter === 'week') {
            params.date_from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          } else if (filter === 'month') {
            params.date_from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          } else if (filter === 'year') {
            params.date_from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          }
          
          const response = await getPredictions(params);
          setPredictions(response.results || response || []);
        } catch (err) {
          console.log('Erreur lors de la récupération de l\'historique');
        }
      } catch (err) {
        setError('Erreur lors du chargement des prédictions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [filter]);

  // Fonction pour obtenir le texte du niveau de risque
  const getRiskLevelText = (level) => {
    const levels = {
      'FAIBLE': 'Faible',
      'MODERE': 'Modéré',
      'ELEVE': 'Élevé',
      'CRITIQUE': 'Critique'
    };
    return levels[level] || level;
  };

  // Fonction pour obtenir la couleur du niveau de risque
  const getRiskLevelColor = (level) => {
    const colors = {
      'FAIBLE': 'text-green-600 bg-green-50 border-green-200',
      'MODERE': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'ELEVE': 'text-orange-600 bg-orange-50 border-orange-200',
      'CRITIQUE': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[level] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 px-4 py-4">
      {/* Section Prédiction Actuelle */}
      {latestPrediction && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Prédiction Actuelle</h2>
          
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-primary-green mb-2">
              {(latestPrediction.probabilite_pneumonie_72h * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Probabilité de pneumonie dans les 72h
            </div>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getRiskLevelColor(latestPrediction.niveau_risque)}`}>
              {getRiskLevelText(latestPrediction.niveau_risque)}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Dernière mise à jour</span>
              <span className="font-semibold">{formatDate(latestPrediction.created_at)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Fenêtre de prédiction : 72 heures
            </div>
          </div>
        </div>
      )}

      {/* Section Historique Prédictions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Historique des Prédictions</h2>
          
          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('week')}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                filter === 'week' 
                  ? 'bg-primary-green text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                filter === 'month' 
                  ? 'bg-primary-green text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setFilter('year')}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                filter === 'year' 
                  ? 'bg-primary-green text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Année
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : predictions.length > 0 ? (
          <>
            {/* Graphique d'évolution */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Évolution de la Probabilité</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={predictions
                    .slice()
                    .reverse()
                    .map((pred) => ({
                      date: new Date(pred.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      }),
                      probabilité: (pred.probabilite_pneumonie_72h * 100).toFixed(1)
                    }))}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    domain={[0, 100]}
                    label={{ value: 'Probabilité (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Probabilité']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="probabilité" 
                    stroke="#00A651" 
                    strokeWidth={2}
                    dot={{ fill: '#00A651', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Probabilité (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Liste des prédictions */}
            <div className="space-y-3">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-lg font-semibold text-gray-800">
                        {(pred.probabilite_pneumonie_72h * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(pred.created_at)}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(pred.niveau_risque)}`}>
                      {getRiskLevelText(pred.niveau_risque)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucune prédiction disponible
          </div>
        )}
      </div>

      {/* Section Facteurs Explicatifs */}
      {latestPrediction && latestPrediction.input_data && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Facteurs Utilisés</h2>
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Les prédictions sont calculées à partir de {latestPrediction.input_data.length} facteurs incluant :
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Données patient (âge, comorbidités, statut vaccinal)</li>
              <li>Mesures physiologiques (température, SpO₂, rythme respiratoire)</li>
              <li>Indicateurs calculés (CURB-65, tendances, deltas)</li>
            </ul>
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

export default Predictions;
