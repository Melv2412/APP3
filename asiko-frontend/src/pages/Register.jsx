/**
 * Page Register - Version Premium Medical iOS
 */
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const accountType = searchParams.get('type') || 'PATIENT';

  const [formData, setFormData] = useState({
    full_name: '',
    lieu_fonction: '',
    email: '',
    fonction: '',
    phone: '',
    age: '',
    password: '',
    role: accountType,
    diabetes: false,
    asthma: false,
    depression: false,
    smoking_status: 'NEVER',
    vaccination_status: 'OK',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Acceptez les conditions');
      return;
    }

    setLoading(true);

    try {
      const nameParts = formData.full_name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const registrationData = {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password,
        first_name: first_name,
        last_name: last_name || first_name,
        role: formData.role,
        phone: formData.phone || '',
        age: formData.age ? parseInt(formData.age) : null,
        diabetes: formData.diabetes,
        asthma: formData.asthma,
        depression: formData.depression,
        smoking_status: formData.smoking_status,
        vaccination_status: formData.vaccination_status,
      };

      await register(registrationData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = 'text', placeholder, icon }) => (
    <div className="mb-4">
       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
       <div className="relative group">
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required
            className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 shadow-sm"
          />
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 animate-in slide-in-from-top duration-700">
           <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
           </button>
           <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Inscription</h1>
           <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom duration-1000">
           {/* PERSONAL SECTION */}
           <div className="bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm">
              <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">Informations Personnelles</h3>
              <InputField label="Nom COMPLET" name="full_name" placeholder="Ex: Jean Dupont" />
              <InputField label="Email" name="email" type="email" placeholder="jean@exemple.com" />
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Âge" name="age" type="number" placeholder="25" />
                 <InputField label="Téléphone" name="phone" type="tel" placeholder="01..." />
              </div>
           </div>

           {/* PROFESSIONAL / CONTEXT SECTION */}
           <div className="bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm">
              <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">Contexte</h3>
              <InputField label="Fonction" name="fonction" placeholder="Ex: Étudiant" />
              <InputField label="Lieu" name="lieu_fonction" placeholder="Ex: Université" />
           </div>

           {/* MEDICAL SECTION (Only for Patients) */}
           {formData.role === 'PATIENT' && (
              <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-2xl">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Profil Médical</h3>
                 
                 <div className="space-y-4 mb-6">
                    {[
                      { l: 'Diabète', n: 'diabetes' },
                      { l: 'Asthme', n: 'asthma' },
                      { l: 'Dépression', n: 'depression' },
                    ].map(item => (
                      <label key={item.n} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all border border-white/5">
                         <span className="text-xs font-black uppercase tracking-widest">{item.l}</span>
                         <input type="checkbox" name={item.n} checked={formData[item.n]} onChange={handleChange} className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500" />
                      </label>
                    ))}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tabac</label>
                       <select name="smoking_status" value={formData.smoking_status} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white focus:ring-emerald-500">
                          <option value="NEVER">Jamais</option>
                          <option value="FORMER">Ancien</option>
                          <option value="CURRENT">Fumeur</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Vaccination</label>
                       <select name="vaccination_status" value={formData.vaccination_status} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white focus:ring-emerald-500">
                          <option value="OK">OK</option>
                          <option value="EN_RETARD">Retard</option>
                       </select>
                    </div>
                 </div>
              </div>
           )}

           {/* SECURITY SECTION */}
           <div className="bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm">
              <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">Sécurité</h3>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
                 <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                 </div>
              </div>
           </div>

           {/* TERMS & SUBMIT */}
           <div className="space-y-6">
              <label className="flex items-center gap-3 px-2 cursor-pointer group">
                 <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="w-5 h-5 rounded-lg border-slate-200 text-emerald-500 focus:ring-emerald-500" required />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    J'accepte les <Link to="/terms" className="text-emerald-600">conditions générales</Link>
                 </span>
              </label>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-2xl border border-red-100 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">
                   {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Créer mon compte</>
                )}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
