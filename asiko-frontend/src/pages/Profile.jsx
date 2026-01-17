/**
 * Page Profile - Version Premium Medical iOS
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, updateUserProfile } from '../services/users';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getCurrentUser();
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
        });
      } catch (err) {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await updateUserProfile(formData);
      setSuccess('Profil mis à jour');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de mise à jour');
    }
  };

  const userName = user?.first_name || user?.username || 'Utilisateur';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 pt-8 px-6">
      {/* HEADER iOS STYLE */}
      <div className="mb-10 animate-in slide-in-from-top duration-700">
         <div className="flex flex-col items-center">
            <div className="relative mb-6 group">
               <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl flex items-center justify-center text-3xl font-black text-emerald-600 border-4 border-white overflow-hidden transition-transform group-hover:scale-105 duration-500">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
               </div>
               <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-2xl border-4 border-[#F8F9FB] shadow-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{userName}</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Identifiant: #{user?.id || '...'}</p>
         </div>
      </div>

      {/* MESSAGES */}
      {(error || success) && (
        <div className={`mb-6 p-4 rounded-2xl border animate-in zoom-in ${error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} text-xs font-bold`}>
           {error || success}
        </div>
      )}

      {/* SETTINGS GROUP iOS STYLE */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Informations</h2>
             {!editing && (
               <button onClick={() => setEditing(true)} className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Modifier</button>
             )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Prénom', name: 'first_name', type: 'text' },
                { label: 'Nom', name: 'last_name', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Téléphone', name: 'phone', type: 'tel' },
              ].map((field) => (
                <div key={field.name}>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">{field.label}</label>
                   <input
                     name={field.name}
                     type={field.type}
                     value={formData[field.name]}
                     onChange={handleChange}
                     className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300"
                   />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                 <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-4 rounded-[20px] text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">Enregistrer</button>
                 <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-[20px] text-xs uppercase tracking-widest active:scale-95 transition-all">Annuler</button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
               {[
                 { label: 'Prénom', val: formData.first_name, icon: '👤' },
                 { label: 'Nom', val: formData.last_name, icon: '🏷️' },
                 { label: 'Email', val: formData.email, icon: '✉️' },
                 { label: 'Téléphone', val: formData.phone || 'Non renseigné', icon: '📞' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="text-xl">{item.icon}</div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                       <p className="text-[15px] font-bold text-slate-900">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="space-y-3">
         <button onClick={() => logout()} className="w-full bg-white text-red-500 font-black py-5 rounded-[28px] text-[13px] uppercase tracking-[0.15em] border border-red-50 shadow-sm active:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Quitter la session
         </button>
         <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">AsikoConnect v1.0.4 • 2026</p>
      </div>
    </div>
  );
};

export default Profile;
