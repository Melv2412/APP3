/**
 * Page Register Type (Sélection Type de Compte)
 * Page de sélection du type de compte - Design moderne avec animations
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterType = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      navigate(`/register?type=${selectedType}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green/10 via-white to-primary-green/5 flex flex-col items-center justify-center px-4 py-8">
      {/* Styles CSS personnalisés pour les délais d'animation */}
      <style jsx>{`
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
      `}</style>

      {/* Container principal avec animation d'entrée */}
      <div className="w-full max-w-md animate-fade-in">
        {/* Titre AsikoConnect avec animation */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-green to-dark-green bg-clip-text text-transparent mb-2 animate-slide-up">
            AsikoConnect
          </h1>
          <p className="text-gray-600 text-sm animate-slide-up animation-delay-200">
            Choisissez votre profil
          </p>
        </div>

        {/* Titre Créer un compte avec animation */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary-green animate-slide-up animation-delay-400">
            Créer un compte
          </h2>
        </div>

        {/* Sélection Type de Compte avec animation */}
        <div className="w-full max-w-md space-y-8 animate-slide-up animation-delay-600">
          <div className="flex gap-6 justify-center">
            {/* Carte User/Patient avec animations améliorées */}
            <button
              onClick={() => handleTypeSelect('PATIENT')}
              className={`group relative flex-1 max-w-[160px] aspect-square rounded-3xl flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-105 ${
                selectedType === 'PATIENT'
                  ? 'bg-gradient-to-br from-primary-green to-dark-green text-white shadow-2xl scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-primary-green hover:text-white shadow-lg border border-gray-100'
              }`}
            >
              {/* Glow effect pour la sélection */}
              {selectedType === 'PATIENT' && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-green to-dark-green opacity-20 blur-xl animate-pulse"></div>
              )}

              {/* Icône User/Patient avec animation */}
              <div className="relative z-10 mb-4">
                <svg
                  className={`w-20 h-20 transition-all duration-300 ${
                    selectedType === 'PATIENT' ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              {/* Texte avec animation */}
              <span className={`font-semibold text-center text-sm transition-all duration-300 ${
                selectedType === 'PATIENT' ? 'scale-105' : 'group-hover:scale-105'
              }`}>
                utilisateur/patient
              </span>

              {/* Indicateur de sélection */}
              {selectedType === 'PATIENT' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-4 h-4 text-primary-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {/* Carte Professionals avec animations améliorées */}
            <button
              onClick={() => handleTypeSelect('DOCTOR')}
              className={`group relative flex-1 max-w-[160px] aspect-square rounded-3xl flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-105 ${
                selectedType === 'DOCTOR'
                  ? 'bg-gradient-to-br from-primary-green to-dark-green text-white shadow-2xl scale-105'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-primary-green hover:text-white shadow-lg border border-gray-100'
              }`}
            >
              {/* Glow effect pour la sélection */}
              {selectedType === 'DOCTOR' && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-green to-dark-green opacity-20 blur-xl animate-pulse"></div>
              )}

              {/* Icône Stethoscope avec animation */}
              <div className="relative z-10 mb-4">
                <svg
                  className={`w-20 h-20 transition-all duration-300 ${
                    selectedType === 'DOCTOR' ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>

              {/* Texte avec animation */}
              <span className={`font-semibold text-center text-sm transition-all duration-300 ${
                selectedType === 'DOCTOR' ? 'scale-105' : 'group-hover:scale-105'
              }`}>
                professionnels
              </span>

              {/* Indicateur de sélection */}
              {selectedType === 'DOCTOR' && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-4 h-4 text-primary-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Lien Login avec animation */}
          <div className="text-center animate-fade-in animation-delay-800">
            <p className="text-gray-600 text-sm">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-primary-green font-semibold hover:text-dark-green transition-colors duration-200 hover:scale-105 inline-block"
              >
                se connecter
              </Link>
            </p>
          </div>

          {/* Bouton Continuer avec animation améliorée */}
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`w-full font-bold py-4 rounded-xl transition-all duration-300 transform ${
              selectedType
                ? 'bg-gradient-to-r from-primary-green to-dark-green text-white hover:from-dark-green hover:to-primary-green shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedType ? 'Continuer' : 'Sélectionnez un type'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterType;
