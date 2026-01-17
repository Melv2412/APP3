/**
 * Page Login - Version Premium Medical iOS
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = 'Identifiants invalides';
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.response?.data?.detail) errorMessage = err.response.data.detail;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] animate-pulse"></div>

      <div className="w-full max-w-sm z-10">
        {/* BRAND IDENTITY */}
        <div className="text-center mb-10 animate-in slide-in-from-top duration-700">
           <div className="w-16 h-16 bg-white rounded-[20px] shadow-xl shadow-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-white">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center text-white">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                 </svg>
              </div>
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">AsikoConnect</h1>
           <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">Santé Respiratoire Connectée</p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] animate-in zoom-in duration-700">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adresse Email</label>
                 <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nom@exemple.com"
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                    />
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mot de passe</label>
                    <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Oublié ?</Link>
                 </div>
                 <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                    />
                 </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-2xl border border-red-100 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">
                   {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-[20px] text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Continuer
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
           </form>

           <div className="mt-8 text-center pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Pas encore de compte ?{' '}
                 <Link to="/register/type" className="text-emerald-600 ml-1">S'inscrire</Link>
              </p>
           </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-10">
           Propulsé par KENHILI • 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
