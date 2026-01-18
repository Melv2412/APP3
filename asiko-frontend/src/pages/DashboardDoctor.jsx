/**
 * DashboardDoctor - Version Premium Medical iOS
 */
import { useEffect, useMemo, useState } from 'react';
import {
  getPublicHealthStats,
  getDashboardRiskZones,
  getClusters,
  getTrends,
} from '../services/dashboard';

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value;
};

const StatCard = ({ icon, label, value, subtitle, accent }) => {
  const colors = {
    primary: 'text-indigo-500 bg-indigo-50 border-indigo-100',
    danger: 'text-red-500 bg-red-50 border-red-100',
    warning: 'text-amber-500 bg-amber-50 border-amber-100',
    info: 'text-blue-500 bg-blue-50 border-blue-100',
  };

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-md animate-in zoom-in">
      <div className="flex justify-between items-start mb-4">
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${colors[accent] || colors.primary}`}>
           {icon}
         </div>
      </div>
      <div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
         <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatNumber(value)}</h3>
         <p className="text-[11px] font-bold text-slate-400 mt-1 italic">{subtitle}</p>
      </div>
    </div>
  );
};

const TrendRow = ({ trend, maxValue }) => {
  const percentage = ((trend.total || 0) / maxValue) * 100;
  const highRiskP = trend.total > 0 ? ((trend.high_risk || 0) / trend.total) * 100 : 0;

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-end mb-2">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trend.date}</span>
         <span className="text-[11px] font-black text-slate-900">{trend.total} SIGNAUX</span>
      </div>
      <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
         <div className="h-full bg-slate-200 rounded-full flex overflow-hidden">
            <div className="h-full bg-indigo-400 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
            {highRiskP > 0 && (
               <div className="h-full bg-red-400 transition-all duration-1000" style={{ width: `${highRiskP}%` }}></div>
            )}
         </div>
      </div>
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, zonesRes, clustersRes, trendsRes] = await Promise.all([
          getPublicHealthStats(),
          getDashboardRiskZones(),
          getClusters(),
          getTrends(),
        ]);
        setStats(statsRes);
        setRiskZones(zonesRes);
        setClusters(clustersRes);
        setTrends(trendsRes);
      } catch (err) {
        setError(err?.response?.data?.detail || 'Erreur de connexion.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const maxValue = useMemo(() => Math.max(...trends.map(t => t.total || 0), 1), [trends]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      {/* HEADER iOS STYLE */}
      <div className="mb-10 animate-in slide-in-from-top duration-700">
        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1">Surveillance</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Dashboard Médical</h1>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] text-center mb-8">
           <p className="text-red-600 font-bold text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* STATS BEYOND DASHBOARD */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="👥" label="Cas suspects" value={stats?.predictions_last_7_days?.total || 0} subtitle="Cette semaine" accent="primary" />
            <StatCard icon="🛡️" label="Zones actives" value={riskZones?.length || 0} subtitle="Rayon 10km" accent="info" />
            <StatCard icon="🔔" label="Alertes SpO₂" value={stats?.alerts?.active || 0} subtitle="Aujourd'hui" accent="warning" />
            <StatCard icon="⚠️" label="Haute Risque" value={stats?.predictions_last_7_days?.high_risk || 0} subtitle="Priorité urgence" accent="danger" />
          </div>

          {/* TENDANCES CARTE DESIGN */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Épidémiologie</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Tendances (14 jours)</p>
                </div>
                <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                   <div className="w-2 h-2 rounded-full bg-red-400"></div>
                </div>
             </div>
             
             {trends.length > 0 ? (
               <div className="space-y-6">
                  {trends.slice(0, 5).map((t, i) => <TrendRow key={i} trend={t} maxValue={maxValue} />)}
               </div>
             ) : (
               <div className="text-center py-10 opacity-30 font-black text-xs uppercase tracking-[0.3em]">Pas de données</div>
             )}
          </div>

          {/* VULNERABILITY MINI CARDS */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Profil de Vulnérabilité Collective</h3>
             <div className="flex justify-between items-center px-4">
                {[
                  { k: 'tres_eleve', l: 'Critique', c: 'text-red-400' },
                  { k: 'eleve', l: 'Élevé', c: 'text-amber-400' },
                  { k: 'modere', l: 'Modéré', c: 'text-blue-400' },
                ].map((v, i) => (
                  <div key={i} className="text-center">
                     <p className={`text-2xl font-black ${v.c}`}>{stats?.vulnerability_distribution?.[v.k] ?? 0}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">{v.l}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* LISTS SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
             <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Zones Sensibles
                </h3>
                <div className="space-y-4">
                  {(riskZones || []).slice(0, 3).map((z, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-xs font-black text-slate-900 leading-tight mb-1">{z.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{z.respiratory_signal_count} Signaux • {z.risk_level}</p>
                    </div>
                  ))}
                  {riskZones.length === 0 && <p className="text-center text-[10px] text-slate-300 font-bold uppercase py-4">R.A.S</p>}
                </div>
             </div>

             <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 bg-red-500 rounded-full"></span> Clusters Actifs
                </h3>
                <div className="space-y-4">
                  {(clusters || []).slice(0, 3).map((c, i) => (
                    <div key={i} className="p-4 bg-red-50/50 rounded-2xl border border-red-50">
                       <p className="text-xs font-black text-slate-900 leading-tight mb-1">{c.name}</p>
                       <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{c.high_risk_predictions_count} Cas Confirmés</p>
                    </div>
                  ))}
                  {clusters.length === 0 && <p className="text-center text-[10px] text-slate-300 font-bold uppercase py-4">Aucun cluster</p>}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDoctor;
