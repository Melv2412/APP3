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

// Icônes SVG modernes
const UserGroupIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ExclamationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// Carte de statistique moderne avec icône
const ModernStatCard = ({ icon: Icon, label, value, trend, accent = 'primary', subtitle }) => {
  const accentColors = {
    primary: 'bg-primary-green/10 text-primary-green border-primary-green/20',
    danger: 'bg-asiko-red/10 text-asiko-red border-asiko-red/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    info: 'bg-asiko-blue/10 text-asiko-blue border-asiko-blue/20',
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-asiko-lg border border-asiko-gray shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-body-sm text-asiko-gray-dark font-medium mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-heading-lg font-bold text-asiko-gray-darker">{formatNumber(value)}</h3>
            {trend && (
              <span className={`text-body-xs font-semibold ${trend > 0 ? 'text-primary-green' : 'text-asiko-red'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-body-xs text-asiko-gray-dark mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${accentColors[accent]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Liste moderne avec badges
const ModernList = ({ title, items, emptyText, icon: Icon }) => (
  <div className="bg-white rounded-asiko-lg border border-asiko-gray shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary-green" />}
        <h3 className="font-bold text-heading-sm text-asiko-gray-darker">{title}</h3>
      </div>
      <span className="px-2.5 py-1 bg-asiko-gray-light rounded-full text-body-xs font-semibold text-asiko-gray-dark">
        {items?.length || 0}
      </span>
    </div>
    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
      {items && items.length > 0 ? (
        items.map((item, idx) => (
          <div 
            key={`${title}-${idx}`} 
            className="p-4 rounded-asiko border border-asiko-gray-light hover:border-primary-green hover:bg-light-green transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-body-md text-asiko-gray-darker">{item.title}</p>
                {item.subtitle && <p className="text-body-sm text-asiko-gray-dark mt-1">{item.subtitle}</p>}
              </div>
              {item.badge && (
                <span className={`px-2 py-1 rounded-full text-body-xs font-bold ${
                  item.badge === 'CRITICAL' ? 'bg-asiko-red text-white' :
                  item.badge === 'HIGH' ? 'bg-amber-500 text-white' :
                  'bg-asiko-blue-light text-asiko-blue'
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
            {item.meta && <p className="text-body-xs text-asiko-gray mt-2">{item.meta}</p>}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-body-sm text-asiko-gray-dark">{emptyText}</p>
        </div>
      )}
    </div>
  </div>
);

// Graphique de tendances simplifié
const TrendChart = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-12 text-asiko-gray-dark">
        <TrendingUpIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p className="text-body-sm">Aucune donnée de tendance disponible</p>
      </div>
    );
  }

  const maxValue = Math.max(...trends.map(t => t.total || 0), 1);

  return (
    <div className="space-y-3">
      {trends.slice(0, 7).map((trend, idx) => {
        const percentage = ((trend.total || 0) / maxValue) * 100;
        const highRiskPercentage = trend.total > 0 ? ((trend.high_risk || 0) / trend.total) * 100 : 0;
        
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-body-xs">
              <span className="text-asiko-gray-dark font-medium">{trend.date}</span>
              <div className="flex items-center gap-3">
                <span className="text-asiko-gray-darker font-semibold">{trend.total} prédictions</span>
                {trend.high_risk > 0 && (
                  <span className="text-asiko-red font-bold">{trend.high_risk} à risque</span>
                )}
              </div>
            </div>
            <div className="relative h-2 bg-asiko-gray-light rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-primary-green rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
              {highRiskPercentage > 0 && (
                <div 
                  className="absolute h-full bg-asiko-red rounded-full transition-all"
                  style={{ width: `${(percentage * highRiskPercentage) / 100}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
        title: z.name || 'Zone sans nom',
        subtitle: `${z.respiratory_signal_count || 0} signaux respiratoires • ${z.high_risk_predictions_count || 0} prédictions à risque`,
        meta: `Pollution: ${Math.round(z.pollution_level || 0)} • Dernière MAJ: ${z.last_updated ? new Date(z.last_updated).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}`,
        badge: z.risk_level,
      })),
    [riskZones]
  );

  const clustersList = useMemo(
    () =>
      (clusters || []).map((z) => ({
        title: z.name || 'Cluster sans nom',
        subtitle: `${z.high_risk_predictions_count || 0} prédictions à haut risque`,
        meta: `Pollution: ${Math.round(z.pollution_level || 0)} • ${z.respiratory_signal_count || 0} signaux`,
        badge: z.risk_level,
      })),
    [clusters]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-asiko-red/10 border border-asiko-red/20 rounded-asiko-lg p-4">
          <p className="text-asiko-red font-semibold">Erreur : {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-xl font-bold text-asiko-gray-darker">Dashboard Santé Publique</h1>
          <p className="text-body-md text-asiko-gray-dark mt-1">Surveillance épidémiologique et prévention collective</p>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          icon={UserGroupIcon}
          label="Cas suspects"
          value={stats?.predictions_last_7_days?.total || 0}
          subtitle="cette semaine"
          accent="primary"
        />
        <ModernStatCard
          icon={ShieldIcon}
          label="Zones à risque"
          value={riskZones?.length || 0}
          subtitle="actives"
          accent="info"
        />
        <ModernStatCard
          icon={BellIcon}
          label="Alertes SpO₂"
          value={stats?.alerts?.active || 0}
          subtitle="aujourd'hui"
          accent="warning"
        />
        <ModernStatCard
          icon={ExclamationIcon}
          label="Taux anormale"
          value={stats?.predictions_last_7_days?.high_risk || 0}
          subtitle="cas détectés"
          accent="danger"
        />
      </div>

      {/* Tendances épidémiologiques */}
      <div className="bg-white rounded-asiko-lg border border-asiko-gray shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUpIcon className="w-5 h-5 text-primary-green" />
          <h3 className="font-bold text-heading-sm text-asiko-gray-darker">Tendances Épidémiologiques</h3>
          <span className="text-body-xs text-asiko-gray-dark">(14 derniers jours)</span>
        </div>
        <TrendChart trends={trends} />
      </div>

      {/* Distribution de vulnérabilité */}
      <div className="bg-white rounded-asiko-lg border border-asiko-gray shadow-sm p-5">
        <h3 className="font-bold text-heading-sm text-asiko-gray-darker mb-4">Distribution de Vulnérabilité</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: 'tres_eleve', label: 'Très élevé', color: 'bg-asiko-red text-white' },
            { key: 'eleve', label: 'Élevé', color: 'bg-amber-500 text-white' },
            { key: 'modere', label: 'Modéré', color: 'bg-asiko-blue text-white' },
            { key: 'faible', label: 'Faible', color: 'bg-primary-green text-white' },
            { key: 'tres_faible', label: 'Très faible', color: 'bg-asiko-gray text-white' },
          ].map((item) => (
            <div key={item.key} className={`p-4 rounded-asiko ${item.color} text-center`}>
              <p className="text-body-xs font-semibold opacity-90 mb-1">{item.label}</p>
              <p className="text-heading-lg font-bold">
                {stats?.vulnerability_distribution?.[item.key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Zones et clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModernList 
          title="Zones à Risque" 
          items={riskZonesList} 
          emptyText="Aucune zone à risque active" 
          icon={ShieldIcon}
        />
        <ModernList 
          title="Clusters Critiques" 
          items={clustersList} 
          emptyText="Aucun cluster détecté" 
          icon={ExclamationIcon}
        />
      </div>
    </div>
  );
};

export default DashboardDoctor;
