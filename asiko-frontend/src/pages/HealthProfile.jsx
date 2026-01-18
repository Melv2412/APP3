/**
 * Page Profil de Santé - Version Premium Medical iOS
 * Gestion du profil médical avec indice de vulnérabilité, comorbidités et vaccinations
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getHealthProfile,
  createHealthProfile,
  updateHealthProfile,
  recalculateVulnerability,
  getComorbidities,
  getVaccinationStatuses,
} from '../services/healthProfiles';

const HealthProfile = () => {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState(null);
  const [comorbidities, setComorbidities] = useState([]);
  const [vaccinationStatuses, setVaccinationStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    smoking_status: 'NEVER',
    alcohol_consumption: 'NONE',
    medical_history: '',
    selected_comorbidities: [],
    selected_vaccinations: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        try {
          const profiles = await getHealthProfile();
          const profile = Array.isArray(profiles) && profiles.length > 0 
            ? profiles[0] 
            : (profiles.results && profiles.results.length > 0 ? profiles.results[0] : profiles);
          
          if (profile && profile.id) {
            setHealthProfile(profile);
            setFormData({
              age: profile.age || '',
              height: profile.height || '',
              weight: profile.weight || '',
              smoking_status: profile.smoking_status || 'NEVER',
              alcohol_consumption: profile.alcohol_consumption || 'NONE',
              medical_history: profile.medical_history || '',
              selected_comorbidities: profile.comorbidities || [],
              selected_vaccinations: profile.vaccination_statuses || [],
            });
          }
        } catch (err) {
          console.log('Aucun profil de santé trouvé');
        }

        try {
          const [comorbData, vaccData] = await Promise.all([
            getComorbidities(),
            getVaccinationStatuses(),
          ]);
          
          setComorbidities(Array.isArray(comorbData) ? comorbData : (comorbData.results || []));
          setVaccinationStatuses(Array.isArray(vaccData) ? vaccData : (vaccData.results || []));
        } catch (err) {
          console.error('Erreur lors du chargement des listes', err);
        }
      } catch (err) {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComorbidityToggle = (comorbidity) => {
    setFormData(prev => {
      const current = prev.selected_comorbidities;
      const isSelected = current.some(c => (c.id || c) === (comorbidity.id || comorbidity));
      return {
        ...prev,
        selected_comorbidities: isSelected 
          ? current.filter(c => (c.id || c) !== (comorbidity.id || comorbidity))
          : [...current, comorbidity]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const profileData = {
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        smoking_status: formData.smoking_status,
        alcohol_consumption: formData.alcohol_consumption,
        medical_history: formData.medical_history,
        comorbidity_ids: formData.selected_comorbidities.map(c => c.id || c),
        vaccination_status_ids: formData.selected_vaccinations.map(v => v.id || v),
      };

      let updated;
      if (healthProfile?.id) updated = await updateHealthProfile(healthProfile.id, profileData);
      else updated = await createHealthProfile(profileData);

      setHealthProfile(updated);
      setSuccess('Profil mis à jour');
      setEditing(false);
    } catch (err) {
      setError('Erreur de mise à jour');
    }
  };

  const getVulnerabilityColor = (index) => {
    if (!index) return 'from-slate-400 to-slate-500';
    if (index >= 70) return 'from-red-500 to-rose-600';
    if (index >= 50) return 'from-orange-500 to-amber-600';
    if (index >= 30) return 'from-yellow-400 to-orange-500';
    return 'from-emerald-500 to-teal-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const vIndex = healthProfile?.vulnerability_index || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      {/* HEADER iOS STYLE */}
      <div className="mb-10 animate-in slide-in-from-top duration-700">
        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Dossier Médical</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Profil de Santé</h1>
      </div>

      {(error || success) && (
        <div className={`mb-8 p-4 rounded-2xl border animate-in zoom-in ${error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} text-xs font-bold`}>
           {error || success}
        </div>
      )}

      {/* VULNERABILITY SCORE CARD */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${getVulnerabilityColor(vIndex)} p-8 rounded-[40px] shadow-xl shadow-emerald-200/20 mb-8 animate-in zoom-in duration-700`}>
         <div className="relative z-10 flex flex-col items-center">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2">Indice de Vulnérabilité</p>
            <div className="text-6xl font-black text-white mb-2">{vIndex.toFixed(1)}</div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[11px] font-black text-white uppercase tracking-wider">
               {vIndex >= 70 ? 'Risque Critique' : vIndex >= 40 ? 'Risque Modéré' : 'Risque Faible'}
            </div>
         </div>
         {/* Abstract background shapes */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>
      </div>

      {/* MAIN FORM / DISPLAY */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Données Physiques</h2>
               {!editing && (
                 <button onClick={() => setEditing(true)} className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Modifier</button>
               )}
            </div>

            {editing ? (
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     {[
                        { label: 'Âge', name: 'age', type: 'number' },
                        { label: 'Taille (cm)', name: 'height', type: 'number' },
                        { label: 'Poids (kg)', name: 'weight', type: 'number' },
                     ].map(f => (
                        <div key={f.name}>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">{f.label}</label>
                           <input name={f.name} type={f.type} value={formData[f.name]} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all" />
                        </div>
                     ))}
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Tabagisme</label>
                     <select name="smoking_status" value={formData.smoking_status} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all appearance-none">
                        <option value="NEVER">Jamais fumé</option>
                        <option value="FORMER">Ancien fumeur</option>
                        <option value="CURRENT">Fumeur actuel</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Comorbidités</label>
                     <div className="flex flex-wrap gap-2 mt-2">
                        {comorbidities.map(c => {
                           const active = formData.selected_comorbidities.some(sc => (sc.id || sc) === c.id);
                           return (
                              <button key={c.id} type="button" onClick={() => handleComorbidityToggle(c)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                 {c.name_display || c.name}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-4 rounded-[24px] text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">Enregistrer</button>
                     <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-[24px] text-xs uppercase tracking-widest active:scale-95 transition-all">Annuler</button>
                  </div>
               </form>
            ) : (
               <div className="grid grid-cols-2 gap-8">
                  {[
                     { l: 'Âge', v: healthProfile?.age || '--', i: '🎂' },
                     { l: 'IMC', v: healthProfile?.bmi || '--', i: '⚖️' },
                     { l: 'Taille', v: healthProfile?.height ? `${healthProfile.height} cm` : '--', i: '📏' },
                     { l: 'Poids', v: healthProfile?.weight ? `${healthProfile.weight} kg` : '--', i: '🏋️' },
                  ].map((item, i) => (
                     <div key={i} className="flex flex-col gap-1 p-4 bg-slate-50 rounded-[24px]">
                        <span className="text-xl mb-1">{item.i}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.l}</span>
                        <span className="text-lg font-black text-slate-900">{item.v}</span>
                     </div>
                  ))}
               </div>
            )}
        </div>
      </div>

      {/* ADDITIONAL INFO CARDS */}
      {!editing && (
         <div className="space-y-4">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Comorbidités & Facteurs</h3>
               <div className="flex flex-wrap gap-2">
                  {healthProfile?.comorbidities?.length > 0 ? (
                     healthProfile.comorbidities.map(c => (
                        <span key={c.id} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border border-red-100">
                           {c.name_display || c.name}
                        </span>
                     ))
                  ) : (
                     <p className="text-slate-400 text-xs font-bold italic">Aucune comorbidité enregistrée.</p>
                  )}
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Consommations</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-[20px]">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tabac</p>
                     <p className="text-xs font-bold text-slate-900">{healthProfile?.smoking_status === 'NEVER' ? 'Non fumeur' : 'Fumeur'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-[20px]">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alcool</p>
                     <p className="text-xs font-bold text-slate-900">{healthProfile?.alcohol_consumption || 'Aucune'}</p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default HealthProfile;
