import { useEffect, useMemo, useState } from 'react';
import {
  getPublicHealthStats,
  getDashboardRiskZones,
  getClusters,
  getTrends,
  getPollutionMap,
} from '../services/dashboard';

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value;
};

const StatCard = ({ label, value, accent = 'primary' }) => {
  const accentClasses =
    accent === 'danger'
      ? 'bg-red-50 text-red-700'
      : accent === 'warning'
      ? 'bg-yellow-50 text-yellow-700'
      : 'bg-primary-green bg-opacity-10 text-primary-green';
  return (
    <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accentClasses}`.replace('bg-', 'text-')}>
        {formatNumber(value)}
      </p>
    </div>
  );
};

const SimpleList = ({ title, items, emptyText }) => (
  <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <span className="text-sm text-gray-500">{items?.length || 0}</span>
    </div>
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {items && items.length > 0 ? (
        items.map((item, idx) => (
          <div key={`${title}-${idx}`} className="rounded-lg border border-gray-100 p-3">
            <p className="font-semibold text-gray-800">{item.title}</p>
            {item.subtitle && <p className="text-sm text-gray-500">{item.subtitle}</p>}
            {item.meta && <p className="text-xs text-gray-400 mt-1">{item.meta}</p>}
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">{emptyText}</p>
      )}
    </div>
  </div>
);

const TrendRow = ({ date, total, high_risk, alerts }) => (
  <tr className="text-sm text-gray-700">
    <td className="py-2">{date}</td>
    <td className="py-2 text-center">{total}</td>
    <td className="py-2 text-center text-red-600 font-semibold">{high_risk}</td>
    <td className="py-2 text-center text-amber-600 font-semibold">{alerts}</td>
  </tr>
);

const DashboardDoctor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [riskZones, setRiskZones] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [trends, setTrends] = useState([]);
  const [pollutionPoints, setPollutionPoints] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, zonesRes, clustersRes, trendsRes, pollutionRes] = await Promise.all([
          getPublicHealthStats(),
          getDashboardRiskZones(),
          getClusters(),
          getTrends(),
          getPollutionMap(),
        ]);
        setStats(statsRes);
        setRiskZones(zonesRes);
        setClusters(clustersRes);
        setTrends(trendsRes);
        setPollutionPoints(pollutionRes);
      } catch (err) {
        setError(err?.response?.data?.detail || 'Erreur lors du chargement du dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const riskZonesList = useMemo(
    () =>
      (riskZones || []).map((z) => ({
        title: `${z.name || 'Zone'} — ${z.risk_level}`,
        subtitle: `Pollution: ${Math.round(z.pollution_level || 0)} | Signaux: ${z.respiratory_signal_count} | Pred high: ${z.high_risk_predictions_count}`,
        meta: `MAJ: ${z.last_updated ? new Date(z.last_updated).toLocaleString() : '-'}`,
      })),
    [riskZones]
  );

  const clustersList = useMemo(
    () =>
      (clusters || []).map((z) => ({
        title: `${z.name || 'Zone'} — ${z.risk_level}`,
        subtitle: `Prédictions haut risque: ${z.high_risk_predictions_count}`,
        meta: `Pollution: ${Math.round(z.pollution_level || 0)} | Signaux: ${z.respiratory_signal_count}`,
      })),
    [clusters]
  );

  const pollutionSummary = useMemo(() => {
    if (!pollutionPoints?.length) return null;
    const last = pollutionPoints[0];
    return {
      count: pollutionPoints.length,
      lastText: `${last.pm25 ?? '-'} PM2.5 / ${last.pm10 ?? '-'} PM10 / ${last.no2 ?? '-'} NO₂`,
    };
  }, [pollutionPoints]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Chargement du dashboard médecin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Santé Publique</h1>
        <p className="text-gray-600 mt-1">Vue médecin / acteur de santé publique</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients" value={stats?.population?.patients} />
        <StatCard label="Médecins" value={stats?.population?.doctors} />
        <StatCard label="Alertes actives" value={stats?.alerts?.active} accent="danger" />
        <StatCard label="Prédictions 7j" value={stats?.predictions_last_7_days?.total} />
        <StatCard
          label="Prédictions haut risque 7j"
          value={stats?.predictions_last_7_days?.high_risk}
          accent="warning"
        />
      </div>

      {/* Vulnérabilité */}
      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
        <h3 className="font-semibold text-gray-800 mb-3">Distribution de vulnérabilité</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: 'tres_eleve', label: 'Très élevé' },
            { key: 'eleve', label: 'Élevé' },
            { key: 'modere', label: 'Modéré' },
            { key: 'faible', label: 'Faible' },
            { key: 'tres_faible', label: 'Très faible' },
          ].map((item) => (
            <div key={item.key} className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-bold text-gray-800">
                {stats?.vulnerability_distribution?.[item.key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Zones et clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimpleList title="Zones à risque" items={riskZonesList} emptyText="Aucune zone à risque active." />
        <SimpleList title="Clusters (High/Critical)" items={clustersList} emptyText="Aucun cluster détecté." />
      </div>

      {/* Tendances */}
      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Tendances (14 derniers jours)</h3>
          <span className="text-sm text-gray-500">{trends?.length || 0} jours</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b">
                <th className="py-2">Date</th>
                <th className="py-2 text-center">Prédictions</th>
                <th className="py-2 text-center">Haut risque</th>
                <th className="py-2 text-center">Alertes</th>
              </tr>
            </thead>
            <tbody>
              {trends && trends.length > 0 ? (
                trends.map((t, idx) => (
                  <TrendRow
                    key={`trend-${idx}`}
                    date={t.date}
                    total={t.total}
                    high_risk={t.high_risk}
                    alerts={t.alerts}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">
                    Pas de données de tendance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pollution map summary */}
      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
        <h3 className="font-semibold text-gray-800 mb-2">Carte pollution (aperçu)</h3>
        {pollutionSummary ? (
          <p className="text-gray-700">
            {pollutionSummary.count} points chargés. Dernier relevé : {pollutionSummary.lastText}
          </p>
        ) : (
          <p className="text-gray-500">Aucune donnée pollution à afficher.</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          (Intégrer une carte si besoin, mais les données sont déjà disponibles pour les graphiques.)
        </p>
      </div>
    </div>
  );
};

export default DashboardDoctor;
