/**
 * Page Login
 * Page de connexion - Suit le design Figma
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Titre Asikoconect */}
      <h1 className="text-4xl font-bold text-primary-green mb-8">
        AsikoConnect
      </h1>

      {/* Formulaire de connexion */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Exemple@gmail.com"
            required
            className="w-full px-4 py-3 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Votre mot de passe"
            required
            className="w-full px-4 py-3 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-primary-green border-primary-green rounded focus:ring-primary-green"
            />
            <span className="text-gray-700">Se souvenir de moi</span>
          </label>
          <Link to="/forgot-password" className="text-primary-green hover:underline">
            Mot de passe oublié
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-asiko-red-light border border-asiko-red text-asiko-red px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Bouton Connexion */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-green text-white font-bold py-4 rounded-lg hover:bg-dark-green transition-colors disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Connexion'}
        </button>

        {/* Lien Register */}
        <p className="text-center text-gray-700">
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/register/type" className="text-primary-green font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Propulsé par KENHILI</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
