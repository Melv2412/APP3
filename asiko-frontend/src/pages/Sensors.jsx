/**
 * Page Données Capteurs - Version Premium Medical iOS
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSensorMeasurements, getLatestMeasurement } from '../services/sensors';

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
        try {
          const latest = await getLatestMeasurement();
          setLatestMeasurement(latest);
        } catch (err) { console.log('Aucune mesure'); }

        try {
          const response = await getSensorMeasurements({ ordering: '-created_at' });
          const data = response.results || response || [];
          setMeasurements(data.slice(0, 10));
        } catch (err) { console.log('Erreur historique'); }
      } catch (err) {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchMeasurements();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (value, type) => {
    if (type === 'spo2') {
      if (value >= 95) return 'text-emerald-500';
      if (value >= 90) return 'text-amber-500';
      return 'text-red-500';
    }
    if (type === 'temperature') {
      if (value >= 36.1 && value <= 37.2) return 'text-emerald-500';
      if (value >= 35.5 && value <= 38.5) return 'text-amber-500';
      return 'text-red-500';
    }
    return 'text-slate-600';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      <div className="flex justify-between items-end mb-8 animate-in slide-in-from-top duration-700">
        <div>
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">IoT Biomérie</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Capteurs</h1>
        </div>
        {latestMeasurement && (
           <div className="bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Live
           </div>
        )}
      </div>

      {latestMeasurement ? (
        <div className="space-y-6">
          {/* DERNIERE MESURE GIGANTE CARD */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden animate-in zoom-in duration-500">
             <div className="absolute top-0 right-0 p-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 animate-pulse">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
             </div>

             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">État Actuel</h2>
             
             <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                   <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-1">Oxygène SpO₂</p>
                   <p className={`text-5xl font-black tracking-tighter ${getStatusColor(latestMeasurement.spo2, 'spo2')}`}>
                      {latestMeasurement.spo2.toFixed(1)}<span className="text-2xl opacity-40 ml-1">%</span>
                   </p>
                </div>
                <div>
                   <p className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-1">Température</p>
                   <p className={`text-5xl font-black tracking-tighter ${getStatusColor(latestMeasurement.temperature, 'temperature')}`}>
                      {latestMeasurement.temperature.toFixed(1)}<span className="text-2xl opacity-40 ml-1">°</span>
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                {[
                  { l: 'BPM', v: latestMeasurement.heart_rate.toFixed(0), c: 'text-blue-500' },
                  { l: 'FR', v: latestMeasurement.respiratory_rate.toFixed(0), c: 'text-purple-500' },
                  { l: 'BP', v: latestMeasurement.systolic_bp.toFixed(0), c: 'text-amber-500' },
                ].map((m, i) => (
                  <div key={i} className="text-center">
                     <p className={`text-xl font-black ${m.c}`}>{m.v}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.l}</p>
                  </div>
                ))}
             </div>
             
             <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest mt-8">
                Données synchronisées le {formatDate(latestMeasurement.created_at)}
             </p>
          </div>

          {/* HISTORIQUE DESIGN iOS */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">Derniers Relevés</h3>
             {measurements.map((m, i) => (
               <div key={m.id} className="bg-white/80 backdrop-blur-md rounded-[28px] p-5 border border-white shadow-sm flex items-center justify-between animate-in slide-in-from-bottom" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg">
                        📊
                     </div>
                     <div>
                        <p className="text-[13px] font-black text-slate-800">{formatDate(m.created_at)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CURB-65 Score: {m.curb65}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="text-right">
                        <p className="text-sm font-black text-emerald-500">{m.spo2.toFixed(0)}%</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase">SpO₂</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-red-400">{m.temperature.toFixed(1)}°</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Temp</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-sm">
           <p className="text-5xl mb-6">📡</p>
           <h3 className="text-xl font-black text-slate-900 mb-2">En attente des capteurs</h3>
           <p className="text-slate-400 text-sm font-medium max-w-[200px] mx-auto">Veuillez porter vos dispositifs connectés pour le suivi en temps réel.</p>
        </div>
      )}

      {error && (
        <div className="mt-8 bg-red-50 p-4 rounded-2xl border border-red-100 text-red-600 text-[10px] font-black uppercase text-center tracking-widest">
           {error}
        </div>
      )}
    </div>
  );
};

export default Sensors;
