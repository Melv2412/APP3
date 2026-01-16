import { useEffect, useMemo, useState } from 'react';
import { getHealthJournal } from '../services/dashboard';
import { useAuth } from '../context/AuthContext';

const FILTERS = [
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '90d', label: '90 jours' },
  { key: 'all', label: 'Tout' },
  { key: 'custom', label: 'Plage personnalisée' },
];

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return d.toLocaleString();
};

const formatDateISO = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
};

const Tag = ({ children, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

const JournalItem = ({ item }) => {
  const { type, created_at } = item;

  if (type === 'prediction') {
    return (
      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag color="blue">Prédiction</Tag>
            <Tag color="red">{item.niveau_risque || '-'}</Tag>
          </div>
          <span className="text-xs text-gray-500">{formatDateTime(created_at)}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {(item.probabilite_pneumonie_72h ?? '-')} <span className="text-sm text-gray-500">proba 72h</span>
        </p>
      </div>
    );
  }

  if (type === 'measurement') {
    return (
      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag color="green">Mesure</Tag>
            <Tag>SpO₂ {item.spo2 ?? '-'}</Tag>
            <Tag>Temp {item.temperature ?? '-'}</Tag>
            <Tag>FR {item.respiratory_rate ?? '-'}</Tag>
          </div>
          <span className="text-xs text-gray-500">{formatDateTime(created_at)}</span>
        </div>
        <div className="text-sm text-gray-700 mt-2">
          FC {item.heart_rate ?? '-'} | PAS {item.systolic_bp ?? '-'} | WBC {item.wbc ?? '-'} | CURB65{' '}
          {item.curb65 ?? '-'}
        </div>
      </div>
    );
  }

  if (type === 'action') {
    return (
      <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag color="amber">Action</Tag>
            <Tag>{item.priority || 'MEDIUM'}</Tag>
            {item.completed ? <Tag color="green">Complétée</Tag> : <Tag color="red">À faire</Tag>}
          </div>
          <span className="text-xs text-gray-500">{formatDateTime(created_at)}</span>
        </div>
        <p className="text-gray-900 font-semibold mt-2">{item.recommendation_text}</p>
        <p className="text-xs text-gray-500 mt-1">{item.action_type}</p>
      </div>
    );
  }

  return null;
};

const HealthJournal = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ predictions: [], measurements: [], prevention_actions: [] });
  const [filter, setFilter] = useState('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        const now = new Date();
        if (filter === '7d') {
          params.date_from = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
        } else if (filter === '30d') {
          params.date_from = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
        } else if (filter === '90d') {
          params.date_from = new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString();
        } else if (filter === 'custom') {
          if (customFrom) params.date_from = new Date(customFrom).toISOString();
          if (customTo) params.date_to = new Date(customTo).toISOString();
        }
        const res = await getHealthJournal(params);
        setData(res || {});
      } catch (err) {
        setError(err?.response?.data?.detail || 'Erreur lors du chargement du carnet.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter, customFrom, customTo]);

  const timeline = useMemo(() => {
    const items = [];
    (data.predictions || []).forEach((p) => items.push({ ...p, type: 'prediction' }));
    (data.measurements || []).forEach((m) => items.push({ ...m, type: 'measurement' }));
    (data.prevention_actions || []).forEach((a) => items.push({ ...a, type: 'action' }));
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [data]);

  const summary = useMemo(() => {
    const preds = data.predictions?.length || 0;
    const meas = data.measurements?.length || 0;
    const acts = data.prevention_actions?.length || 0;
    const completedActs = (data.prevention_actions || []).filter((a) => a.completed).length;
    return { preds, meas, acts, completedActs };
  }, [data]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carnet Santé</h1>
          <p className="text-gray-600">Journal agrégé (prédictions, mesures, actions). Utilisateur : {user?.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-sm border ${
                filter === f.key ? 'bg-primary-green text-white border-primary-green' : 'bg-white text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Du</label>
            <input
              type="date"
              value={customFrom || formatDateISO(new Date(Date.now() - 30 * 24 * 3600 * 1000))}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Au</label>
            <input
              type="date"
              value={customTo || formatDateISO(new Date())}
              onChange={(e) => setCustomTo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <p className="text-xs text-gray-500">Les exports PDF/JSON ne sont pas encore disponibles côté backend.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
          <p className="text-sm text-gray-500">Prédictions</p>
          <p className="text-2xl font-bold text-gray-900">{summary.preds}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
          <p className="text-sm text-gray-500">Mesures</p>
          <p className="text-2xl font-bold text-gray-900">{summary.meas}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
          <p className="text-sm text-gray-500">Actions</p>
          <p className="text-2xl font-bold text-gray-900">{summary.acts}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
          <p className="text-sm text-gray-500">Actions complétées</p>
          <p className="text-2xl font-bold text-gray-900">{summary.completedActs}</p>
        </div>
      </div>

      {loading && <p className="text-gray-600">Chargement du carnet...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          {timeline.length === 0 && (
            <p className="text-gray-500 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              Aucune entrée à afficher pour cette période.
            </p>
          )}
          {timeline.map((item) => (
            <JournalItem key={`${item.type}-${item.id}-${item.created_at}`} item={item} />
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">Export</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (filter === 'custom') {
                if (customFrom) params.set('date_from', new Date(customFrom).toISOString());
                if (customTo) params.set('date_to', new Date(customTo).toISOString());
              } else if (filter === '7d') {
                params.set('date_from', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString());
              } else if (filter === '30d') {
                params.set('date_from', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString());
              } else if (filter === '90d') {
                params.set('date_from', new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString());
              }
              
              const url = `${process.env.REACT_APP_API_URL}/dashboard/health-journal/export/?${params.toString()}`;
              window.open(url, '_blank');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            📄 Exporter JSON
          </button>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            title="PDF export sera disponible prochainement"
          >
            📕 Exporter PDF (Bientôt)
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          L'export inclut toutes les données du carnet pour la période sélectionnée.
        </p>
      </div>
    </div>
  );
};

export default HealthJournal;
