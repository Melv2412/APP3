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
    password: '',
    role: accountType,
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
      };

      await register(registrationData);
      navigate('/login');
    } catch (err) {
      // Gérer les erreurs de validation
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message
        || (err.response?.data?.password && Array.isArray(err.response.data.password) 
            ? err.response.data.password[0] 
            : err.response?.data?.password)
        || 'Erreur d\'inscription';
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

        {/* Password (ajouté pour le backend) */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            required
            className="w-full px-4 py-3 bg-green-50 border border-primary-green rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
          />
        </div>

        {/* Checkbox Terms */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary-green border-primary-green rounded focus:ring-primary-green"
          />
          <label htmlFor="agreeTerms" className="text-sm text-gray-700">
            J'accepte les{' '}
            <Link to="/terms" className="text-orange-600 font-bold hover:underline">
              conditions
            </Link>
            {' '}et la{' '}
            <Link to="/privacy" className="text-orange-600 font-bold hover:underline">
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

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Bouton Inscription */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-green text-white font-bold py-4 rounded-lg hover:bg-dark-green transition-colors disabled:opacity-50"
        >
          {loading ? 'Inscription...' : 'Inscription'}
        </button>
      </form>
    </div>
  );
};

export default Register;
