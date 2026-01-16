/**
 * Page Login
 * Page de connexion - Design moderne avec animations Tailwind
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
      // Gérer différents types d'erreurs
      let errorMessage = 'Erreur de connexion';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Identifiants invalides. Vérifiez votre email et mot de passe.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Données invalides. Vérifiez vos informations.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
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
        .animation-delay-1000 { animation-delay: 1000ms; }
      `}</style>
      
      {/* Container principal avec animation d'entrée */}
      <div className="w-full max-w-md animate-fade-in">
        {/* Titre AsikoConnect avec animation */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-green to-dark-green bg-clip-text text-transparent mb-2 animate-slide-up">
            AsikoConnect
          </h1>
          <p className="text-gray-600 text-sm animate-slide-up animation-delay-200">
            Votre santé, notre priorité
          </p>
        </div>

        {/* Formulaire de connexion avec ombre et animation */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6 animate-slide-up animation-delay-400"
        >
          {/* Email avec icône et animation */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre.email@exemple.com"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-300 hover:border-primary-green/50 bg-gray-50/50 focus:bg-white"
            />
          </div>

          {/* Password avec icône et animation */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Votre mot de passe"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-300 hover:border-primary-green/50 bg-gray-50/50 focus:bg-white"
            />
          </div>

          {/* Remember me & Forgot password avec animation */}
          <div className="flex items-center justify-between animate-fade-in animation-delay-600">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="mr-3 w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green transition-all duration-200 hover:scale-110"
              />
              <span className="text-gray-700 text-sm group-hover:text-primary-green transition-colors">
                Se souvenir de moi
              </span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-primary-green hover:text-dark-green text-sm font-medium transition-colors duration-200 hover:scale-105"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Error message avec animation */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center animate-shake">
              <svg className="inline w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Bouton Connexion avec animation */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-green to-dark-green text-white font-bold py-4 rounded-xl hover:from-dark-green hover:to-primary-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>

          {/* Lien Register avec animation */}
          <div className="text-center animate-fade-in animation-delay-800">
            <p className="text-gray-600 text-sm">
              Nouveau sur AsikoConnect ?{' '}
              <Link 
                to="/register/type" 
                className="text-primary-green font-semibold hover:text-dark-green transition-colors duration-200 hover:scale-105 inline-block"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </form>

        {/* Footer avec animation */}
        <div className="text-center text-xs text-gray-500 mt-6 animate-fade-in animation-delay-1000">
          <p>Propulsé par KENHILI</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
