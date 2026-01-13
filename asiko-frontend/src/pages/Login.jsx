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
      setError(err.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Titre Asikoconect */}
      <h1 className="text-4xl font-bold text-primary-green mb-8">
        Asikoconect
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
            placeholder="Example@gmail.com"
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
            placeholder="your password"
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
            <span className="text-gray-700">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-primary-green hover:underline">
            Forgot password
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
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
          Don't have an account yet?{' '}
          <Link to="/register/type" className="text-primary-green font-semibold hover:underline">
            Register
          </Link>
        </p>

        {/* Social login */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-4">or sign up with</p>
          <div className="flex justify-center gap-4">
            {/* Facebook */}
            <button
              type="button"
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Login with Facebook"
            >
              <span className="font-bold">f</span>
            </button>
            
            {/* Apple */}
            <button
              type="button"
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              aria-label="Login with Apple"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>
            
            {/* Google */}
            <button
              type="button"
              className="w-12 h-12 bg-white border-2 border-gray-300 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Login with Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Powered by KENHILI</p>
          <p className="mt-2">
            Terms & Conditions and Privacy Policy for new accounts
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
