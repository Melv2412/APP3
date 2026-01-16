import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHealthJournal } from '../services/dashboard';
import { useAuth } from '../context/AuthContext';

const FILTERS = [
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '90d', label: '90 jours' },
  { key: 'all', label: 'Tout' },
  { key: 'custom', label: 'Personnalisé' },
];

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};

const formatDateISO = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
};

// Composant Tag modernisé
const Tag = ({ children, color = 'gray', icon }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${colors[color] || colors.gray}`}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};

// Composant Item modernisé
const JournalItem = ({ item }) => {
  const { type, created_at } = item;

  if (type === 'prediction') {
    const riskColor = item.niveau_risque === 'ELEVE' || item.niveau_risque === 'CRITIQUE' ? 'red' : 
                      item.niveau_risque === 'MODERE' ? 'amber' : 'green';
    
    return (
      <div className="group p-5 rounded-asiko-lg border border-asiko-gray bg-white hover:shadow-lg hover:border-primary-green transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">Prédiction IA</h4>
                <p className="text-xs text-gray-500">{formatDateTime(created_at)}</p>
              </div>
              <Tag color={riskColor}>{item.niveau_risque || 'N/A'}</Tag>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-700">
                {item.probabilite_pneumonie_72h ? `${(item.probabilite_pneumonie_72h * 100).toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-xs text-blue-600 mt-1">Probabilité pneumonie 72h</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'measurement') {
    return (
      <div className="group p-5 rounded-asiko-lg border border-asiko-gray bg-white hover:shadow-lg hover:border-primary-green transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">Mesure Capteur</h4>
                <p className="text-xs text-gray-500">{formatDateTime(created_at)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{item.spo2 ?? '-'}</p>
                <p className="text-xs text-green-600">SpO₂ (%)</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{item.temperature ?? '-'}</p>
                <p className="text-xs text-red-600">Temp (°C)</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{item.heart_rate ?? '-'}</p>
                <p className="text-xs text-blue-600">FC (bpm)</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-700">{item.respiratory_rate ?? '-'}</p>
                <p className="text-xs text-purple-600">FR (/min)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'action') {
    const priorityColor = item.priority === 'HIGH' || item.priority === 'HAUTE' ? 'red' : 
                         item.priority === 'MEDIUM' || item.priority === 'MOYENNE' ? 'amber' : 'green';
    
    return (
      <div className="group p-5 rounded-asiko-lg border border-asiko-gray bg-white hover:shadow-lg hover:border-primary-green transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">Action Préventive</h4>
                <p className="text-xs text-gray-500">{formatDateTime(created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Tag color={priorityColor}>{item.priority || 'MEDIUM'}</Tag>
                {item.completed ? (
                  <Tag color="green" icon="✓">Complétée</Tag>
                ) : (
                  <Tag color="red" icon="○">À faire</Tag>
                )}
              </div>
            </div>
            <p className="text-gray-900 font-medium">{item.recommendation_text}</p>
            <p className="text-xs text-gray-500 mt-2">Type: {item.action_type}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const HealthJournal = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ predictions: [], measurements: [], prevention_actions: [] });
  const [filter, setFilter] = useState('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Déterminer si c'est le propre carnet du patient
  const isOwnJournal = !targetUserId || targetUserId === String(user?.id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        
        if (targetUserId && user?.role === 'DOCTOR') {
          params.user_id = targetUserId;
        }
        
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
  }, [filter, customFrom, customTo, targetUserId, user]);

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

  // Fonction d'export JSON
  const handleExportJSON = () => {
    const exportData = {
      export_date: new Date().toISOString(),
      patient: data.patient_info || { email: user?.email },
      filter: filter,
      summary: summary,
      data: {
        predictions: data.predictions || [],
        measurements: data.measurements || [],
        prevention_actions: data.prevention_actions || [],
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carnet-sante-${formatDateISO(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fonction d'export PDF (simple - peut être amélioré avec une lib comme jsPDF)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête modernisé */}
        <div className="bg-white rounded-asiko-xl shadow-lg border border-asiko-gray p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-heading-xl font-bold text-asiko-gray-darker flex items-center gap-2">
                <svg className="w-8 h-8 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Carnet Santé 
                {targetUserId && user?.role === 'DOCTOR' && data.patient_info && (
                  <span className="text-asiko-blue">
                    ({data.patient_info.first_name} {data.patient_info.last_name || data.patient_info.username})
                  </span>
                )}
              </h1>
              <p className="text-body-md text-asiko-gray-dark mt-1">
                {targetUserId && user?.role === 'DOCTOR' && data.patient_info
                  ? `Consultation du carnet de ${data.patient_info.first_name || data.patient_info.username}` 
                  : 'Journal agrégé de vos données de santé'}
              </p>
            </div>

            {/* Boutons d'export (uniquement pour le patient) */}
            {isOwnJournal && (
              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-asiko-blue text-white rounded-asiko hover:bg-asiko-blue-dark transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">JSON</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-asiko-red text-white rounded-asiko hover:bg-asiko-red-dark transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-asiko p-4 text-center border border-blue-100">
              <p className="text-3xl font-bold text-blue-700">{summary.preds}</p>
              <p className="text-xs text-blue-600 mt-1">Prédictions</p>
            </div>
            <div className="bg-green-50 rounded-asiko p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-700">{summary.meas}</p>
              <p className="text-xs text-green-600 mt-1">Mesures</p>
            </div>
            <div className="bg-amber-50 rounded-asiko p-4 text-center border border-amber-100">
              <p className="text-3xl font-bold text-amber-700">{summary.acts}</p>
              <p className="text-xs text-amber-600 mt-1">Actions</p>
            </div>
            <div className="bg-purple-50 rounded-asiko p-4 text-center border border-purple-100">
              <p className="text-3xl font-bold text-purple-700">{summary.completedActs}</p>
              <p className="text-xs text-purple-600 mt-1">Complétées</p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-asiko-lg shadow-sm border border-asiko-gray p-4">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-asiko font-semibold text-sm transition-all ${
                  filter === f.key
                    ? 'bg-primary-green text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {filter === 'custom' && (
            <div className="flex gap-3 mt-3">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-asiko text-sm"
                placeholder="Du"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-asiko text-sm"
                placeholder="Au"
              />
            </div>
          )}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-asiko-lg p-4 text-red-700">
            {error}
          </div>
        ) : timeline.length === 0 ? (
          <div className="bg-white rounded-asiko-lg shadow-sm border border-asiko-gray p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-medium">Aucune entrée pour cette période</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((item, idx) => (
              <JournalItem key={`${item.type}-${item.id || idx}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthJournal;
