/**
 * Page Register (Inscription)
 * Page d'inscription - Suit le design Figma
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
    // Champs médicaux
    diabetes: false,
    asthma: false,
    depression: false,
    smoking_status: 'NEVER', // Select au lieu de checkbox pour cohérence
    vaccination_status: 'OK', // Nouveau : statut vaccinal OK/EN RETARD
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);

    try {
      // Séparer full_name en first_name et last_name
      const nameParts = formData.full_name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';
      
      // Préparer les données pour le backend
      const registrationData = {
        username: formData.email, // Utiliser email comme username
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password, // Confirmation du mot de passe
        first_name: first_name,
        last_name: last_name || first_name, // Si pas de nom, utiliser le prénom
        role: formData.role,
        phone: formData.phone || '',
        age: formData.age ? parseInt(formData.age) : null,
        // Champs médicaux
        diabetes: formData.diabetes,
        asthma: formData.asthma,
        depression: formData.depression,
        smoking_status: formData.smoking_status, // Select au lieu de booléen
        vaccination_status: formData.vaccination_status, // Nouveau : statut vaccinal
      };

      await register(registrationData);
      navigate('/login');
    } catch (err) {
      // Gérer les erreurs de validation avec plus de détails
      console.error('Erreur inscription:', err.response?.data || err);
      
      let errorMessage = 'Erreur d\'inscription';
      
      if (err.response?.data) {
        // Erreur détaillée du backend
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.non_field_errors) {
          // Erreurs générales
          errorMessage = Array.isArray(err.response.data.non_field_errors) 
            ? err.response.data.non_field_errors[0] 
            : err.response.data.non_field_errors;
        } else {
          // Erreurs de champs spécifiques
          const fieldErrors = Object.keys(err.response.data)
            .map(field => {
              const errors = err.response.data[field];
              if (Array.isArray(errors)) {
                return `${field}: ${errors[0]}`;
              }
              return `${field}: ${errors}`;
            })
            .join(', ');
          
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Titre AsikoConnect */}
      <h1 className="text-4xl font-bold text-primary-green mb-4">
        AsikoConnect
      </h1>

      {/* Titre Inscription */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-primary-green inline-block border-b-2 border-primary-green pb-1">
          inscription
        </h2>
      </div>

      {/* Instruction */}
      <p className="text-gray-600 mb-8 text-center">
        veuillez renseigner les champs
      </p>

      {/* Formulaire d'inscription */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        {/* Nom et Prénom */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom et Prénom
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Ex: Ouattara Tiéba"
            required
            className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* Lieu de fonction */}
        <div>
          <label htmlFor="lieu_fonction" className="block text-sm font-medium text-gray-700 mb-1">
            Lieu de fonction
          </label>
          <input
            type="text"
            id="lieu_fonction"
            name="lieu_fonction"
            value={formData.lieu_fonction}
            onChange={handleChange}
            placeholder="Ex: ESATIC"
            required
            className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ex: Ouattara@gmail.com"
            required
            className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* fonction */}
        <div>
          <label htmlFor="fonction" className="block text-sm font-medium text-gray-700 mb-1">
            fonction
          </label>
          <input
            type="text"
            id="fonction"
            name="fonction"
            value={formData.fonction}
            onChange={handleChange}
            placeholder="Ex: Étudiant"
            required
            className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ex: 0123456789"
            required
            className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* Âge */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Âge
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Ex: 25"
            min="0"
            max="150"
            required
            className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* Section Informations médicales */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Informations médicales</h3>
          
          {/* Diabétique */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="diabetes"
              name="diabetes"
              checked={formData.diabetes}
              onChange={handleChange}
              className="w-4 h-4 text-primary-green border-primary-green rounded focus:ring-primary-green"
            />
            <label htmlFor="diabetes" className="text-sm text-gray-700">
              Diabétique
            </label>
          </div>

          {/* Asthmatique */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="asthma"
              name="asthma"
              checked={formData.asthma}
              onChange={handleChange}
              className="w-4 h-4 text-primary-green border-primary-green rounded focus:ring-primary-green"
            />
            <label htmlFor="asthma" className="text-sm text-gray-700">
              Asthmatique
            </label>
          </div>

          {/* Dépressif */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="depression"
              name="depression"
              checked={formData.depression}
              onChange={handleChange}
              className="w-4 h-4 text-primary-green border-primary-green rounded focus:ring-primary-green"
            />
            <label htmlFor="depression" className="text-sm text-gray-700">
              Dépressif
            </label>
          </div>

          {/* Statut tabagique - Select au lieu de checkbox */}
          <div className="mb-3">
            <label htmlFor="smoking_status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut tabagique
            </label>
            <select
              id="smoking_status"
              name="smoking_status"
              value={formData.smoking_status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
            >
              <option value="NEVER">Jamais</option>
              <option value="FORMER">Ancien fumeur</option>
              <option value="CURRENT">Fumeur actuel</option>
            </select>
          </div>

          {/* Statut vaccinal - Nouveau */}
          <div>
            <label htmlFor="vaccination_status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut vaccinal
            </label>
            <select
              id="vaccination_status"
              name="vaccination_status"
              value={formData.vaccination_status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
            >
              <option value="OK">OK</option>
              <option value="EN_RETARD">EN RETARD</option>
            </select>
          </div>
        </div>

          {/* Mot de passe avec icône et style amélioré */}
          <div className="mb-4 animate-fade-in animation-delay-1000">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-300 hover:border-primary-green/50 bg-gray-50/50 focus:bg-white"
                placeholder="Votre mot de passe"
                required
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirmation mot de passe avec icône */}
          <div className="mb-6 animate-fade-in animation-delay-1100">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-300 hover:border-primary-green/50 bg-gray-50/50 focus:bg-white"
                placeholder="Confirmer votre mot de passe"
                required
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Conditions générales avec style amélioré */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50 animate-fade-in animation-delay-1200">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-primary-green border-2 border-gray-300 rounded focus:ring-primary-green transition-all duration-200 hover:scale-110"
              required
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
              <span className="flex items-center gap-2 mb-1">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                J'accepte les
              </span>
              <Link to="/terms" className="text-primary-green hover:text-primary-green/80 underline font-medium transition-colors">
                conditions générales d'utilisation
              </Link>
              <span className="text-gray-600"> et la </span>
              <Link to="/privacy" className="text-primary-green hover:text-primary-green/80 underline font-medium transition-colors">
                politique de confidentialité
              </Link>
            </label>
          </div>

        {/* Icône Cœur */}
        <div className="flex justify-center py-2">
          <svg
            className="w-12 h-12 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Error message avec style amélioré */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

          {/* Bouton Inscription avec style moderne */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-green to-dark-green text-white font-bold py-4 px-6 rounded-xl hover:from-dark-green hover:to-primary-green transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                S'inscrire
              </>
            )}
          </button>
      </form>
    </div>
  );
};

export default Register;
