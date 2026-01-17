import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHealthJournal } from '../services/dashboard';
import { useAuth } from '../context/AuthContext';

const FILTERS = [
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '90d', label: '90 jours' },
  { key: 'all', label: 'Tout' },
  { key: 'custom', label: 'Libre' },
];

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return d.toLocaleString('fr-FR', { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const Tag = ({ children, type = 'info' }) => {
  const styles = {
    danger: 'bg-red-50 text-red-600 border-red-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100',
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${styles[type]}`}>
      {children}
    </span>
  );
};

const JournalItem = ({ item }) => {
  const { type, created_at } = item;

  const IconWrapper = ({ children, color }) => (
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${color}`}>
      {children}
    </div>
  );

  if (type === 'prediction') {
    const isCritical = item.niveau_risque === 'ELEVE' || item.niveau_risque === 'CRITIQUE';
    const riskType = isCritical ? 'danger' : item.niveau_risque === 'MODERE' ? 'warning' : 'success';
    
    return (
      <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 animate-in slide-in-from-bottom">
        <div className="flex items-start gap-4">
          <IconWrapper color="bg-blue-50 text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </IconWrapper>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Analyse IA</h4>
              <Tag type={riskType}>{item.niveau_risque || 'N/A'}</Tag>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mb-4">{formatDateTime(created_at)}</p>
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">
                  {item.probabilite_pneumonie_72h ? `${(item.probabilite_pneumonie_72h * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Risque Infectieux</p>
              </div>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(item.probabilite_pneumonie_72h || 0) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'measurement') {
    return (
      <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 animate-in slide-in-from-bottom">
        <div className="flex items-start gap-4">
          <IconWrapper color="bg-emerald-50 text-emerald-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </IconWrapper>
          <div className="flex-1">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Signes Vitaux</h4>
            <p className="text-[11px] font-bold text-slate-400 mb-4">{formatDateTime(created_at)}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'SpO₂', val: item.spo2, unit: '%', color: 'text-emerald-600' },
                { label: 'Temp', val: item.temperature, unit: '°C', color: 'text-red-600' },
                { label: 'FC', val: item.heart_rate, unit: 'bpm', color: 'text-blue-600' },
                { label: 'FR', val: item.respiratory_rate, unit: '/m', color: 'text-purple-600' },
              ].map((m, i) => (
                <div key={i} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <p className={`text-lg font-black ${m.color}`}>{m.val ?? '--'}<span className="text-[10px] ml-0.5 opacity-60">{m.unit}</span></p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'action') {
    const isUrgent = item.priority === 'HIGH' || item.priority === 'HAUTE';
    
    return (
      <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 animate-in slide-in-from-bottom">
        <div className="flex items-start gap-4">
          <IconWrapper color="bg-amber-50 text-amber-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </IconWrapper>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Consigne Préventive</h4>
              <Tag type={isUrgent ? 'danger' : 'warning'}>{item.priority || 'MEDIUM'}</Tag>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mb-3">{formatDateTime(created_at)}</p>
            <p className="text-[13px] font-bold text-slate-700 leading-relaxed mb-2 italic">"{item.recommendation_text}"</p>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-emerald-500' : 'bg-red-400'}`}></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {item.completed ? 'Action Terminée' : 'Action en attente'}
               </span>
            </div>
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

  const isOwnJournal = !targetUserId || targetUserId === String(user?.id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (targetUserId && user?.role === 'DOCTOR') params.user_id = targetUserId;
        const now = new Date();
        if (filter === '7d') params.date_from = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
        else if (filter === '30d') params.date_from = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
        else if (filter === '90d') params.date_from = new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString();
        else if (filter === 'custom' && customFrom) params.date_from = new Date(customFrom).toISOString();
        
        const res = await getHealthJournal(params);
        setData(res || {});
      } catch (err) {
        setError(err?.response?.data?.detail || 'Erreur de connexion.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter, customFrom, targetUserId, user]);

  const timeline = useMemo(() => {
    const items = [];
    (data.predictions || []).forEach((p) => items.push({ ...p, type: 'prediction' }));
    (data.measurements || []).forEach((m) => items.push({ ...m, type: 'measurement' }));
    (data.prevention_actions || []).forEach((a) => items.push({ ...a, type: 'action' }));
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [data]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* HEADER iOS STYLE */}
        <div className="mb-10 animate-in slide-in-from-top duration-700">
           <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Historique</p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Carnet</h1>
              </div>
              {isOwnJournal && (
                <div className="flex gap-2">
                   <button onClick={() => window.print()} className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                     </svg>
                   </button>
                </div>
              )}
           </div>

           {/* SUMMARY CARDS iOS STYLE */}
           <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Analyse', val: data.predictions?.length || 0, color: 'text-blue-500 bg-blue-50' },
                { label: 'Mesures', val: data.measurements?.length || 0, color: 'text-emerald-500 bg-emerald-50' },
                { label: 'Alertes', val: data.prevention_actions?.length || 0, color: 'text-amber-500 bg-amber-50' },
                { label: 'Fait', val: (data.prevention_actions || []).filter(a => a.completed).length, color: 'text-purple-500 bg-purple-50' },
              ].map((s, i) => (
                <div key={i} className={`p-3 rounded-2xl border border-white shadow-sm text-center ${s.color}`}>
                   <p className="text-xl font-black">{s.val}</p>
                   <p className="text-[8px] font-black uppercase tracking-wider opacity-70">{s.label}</p>
                </div>
              ))}
           </div>
        </div>

        {/* FILTERS Segmented Control */}
        <div className="bg-slate-100/50 p-1 rounded-2xl mb-8 flex gap-1 border border-slate-200/50 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                flex-1 whitespace-nowrap px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300
                ${filter === f.key 
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-100 scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* TIMELINE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Récupération des données...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] text-center">
            <p className="text-red-600 font-bold text-sm">{error}</p>
          </div>
        ) : timeline.length === 0 ? (
          <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-5xl mb-6">📂</p>
            <h3 className="text-xl font-black text-slate-900 mb-2">Carnet vide</h3>
            <p className="text-slate-400 text-sm font-medium">Aucun événement enregistré sur cette période.</p>
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
