/**
 * Page Register Type (Sélection Type de Compte)
 * Page de sélection du type de compte - Suit le design Figma
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Titre Asikoconect */}
      <h1 className="text-4xl font-bold text-primary-green mb-4">
        Asikoconect
      </h1>

      {/* Titre Create account */}
      <h2 className="text-2xl font-bold text-primary-green mb-8">
        Create account
      </h2>

      {/* Sélection Type de Compte */}
      <div className="w-full max-w-md space-y-6">
        <div className="flex gap-4 justify-center">
          {/* Carte User/Patient */}
          <button
            onClick={() => handleTypeSelect('PATIENT')}
            className={`flex-1 max-w-[150px] aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
              selectedType === 'PATIENT'
                ? 'bg-primary-green text-white shadow-lg scale-105'
                : 'bg-light-green text-gray-700 hover:bg-primary-green hover:text-white'
            }`}
          >
            {/* Icône User/Patient */}
            <svg
              className="w-16 h-16 mb-3"
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
            <span className="font-semibold text-center">user/patient</span>
          </button>

          {/* Carte Professionals */}
          <button
            onClick={() => handleTypeSelect('DOCTOR')}
            className={`flex-1 max-w-[150px] aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
              selectedType === 'DOCTOR'
                ? 'bg-primary-green text-white shadow-lg scale-105'
                : 'bg-light-green text-gray-700 hover:bg-primary-green hover:text-white'
            }`}
          >
            {/* Icône Stethoscope */}
            <svg
              className="w-16 h-16 mb-3"
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
            <span className="font-semibold text-center">professionals</span>
          </button>
        </div>

        {/* Lien Login */}
        <p className="text-center text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-green font-semibold hover:underline">
            login
          </Link>
        </p>

        {/* Bouton Continue */}
        <button
          onClick={handleContinue}
          disabled={!selectedType}
          className="w-full bg-primary-green text-white font-bold py-4 rounded-lg hover:bg-dark-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          continue
        </button>
      </div>
    </div>
  );
};

export default RegisterType;
