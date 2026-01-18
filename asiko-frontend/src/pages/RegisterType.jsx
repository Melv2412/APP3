/**
 * Page RegisterType - Version Premium Medical iOS
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterType = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleContinue = () => {
    if (selectedType) {
      navigate(`/register?type=${selectedType}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-sm z-10 text-center">
        {/* HEADER */}
        <div className="mb-12 animate-in slide-in-from-top duration-700">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Bienvenue</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Choisissez votre profil</h1>
        </div>

        {/* SELECTION GRID */}
        <div className="space-y-4 mb-10">
          <button
            onClick={() => setSelectedType('PATIENT')}
            className={`w-full group relative p-6 rounded-[32px] transition-all duration-500 border flex items-center gap-6 overflow-hidden ${
              selectedType === 'PATIENT'
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl'
                : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 ${selectedType === 'PATIENT' ? 'bg-white/10' : 'bg-slate-50'}`}>
               👤
            </div>
            <div className="text-left">
               <p className={`text-[13px] font-black uppercase tracking-widest ${selectedType === 'PATIENT' ? 'text-white' : 'text-slate-900'}`}>Utilisateur</p>
               <p className={`text-[10px] font-bold ${selectedType === 'PATIENT' ? 'text-slate-400' : 'text-slate-500'}`}>Suivi de santé & prévention</p>
            </div>
            {selectedType === 'PATIENT' && (
              <div className="absolute top-4 right-4 animate-bounce bg-emerald-500 w-2 h-2 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setSelectedType('DOCTOR')}
            className={`w-full group relative p-6 rounded-[32px] transition-all duration-500 border flex items-center gap-6 overflow-hidden ${
              selectedType === 'DOCTOR'
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl'
                : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 ${selectedType === 'DOCTOR' ? 'bg-white/10' : 'bg-slate-50'}`}>
               🩺
            </div>
            <div className="text-left">
               <p className={`text-[13px] font-black uppercase tracking-widest ${selectedType === 'DOCTOR' ? 'text-white' : 'text-slate-900'}`}>Professionnel</p>
               <p className={`text-[10px] font-bold ${selectedType === 'DOCTOR' ? 'text-slate-400' : 'text-slate-500'}`}>Epidémiologie & Conseil</p>
            </div>
            {selectedType === 'DOCTOR' && (
              <div className="absolute top-4 right-4 animate-bounce bg-emerald-500 w-2 h-2 rounded-full"></div>
            )}
          </button>
        </div>

        {/* ACTIONS */}
        <div className="space-y-6">
           <button
             onClick={handleContinue}
             disabled={!selectedType}
             className={`w-full font-black py-4 rounded-[20px] text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
               selectedType
                 ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200 active:scale-95'
                 : 'bg-slate-200 text-slate-400 cursor-not-allowed'
             }`}
           >
             C'est parti
           </button>

           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Déjà membre ?{' '}
              <Link to="/login" className="text-emerald-600 ml-1">Se connecter</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterType;
