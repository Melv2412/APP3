/**
 * Page Profile
 * Page de profil utilisateur avec informations personnelles
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
        setError('Erreur lors du chargement du profil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

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
    setSuccess('');

    try {
      await updateUserProfile(formData);
      setSuccess('Profil mis à jour avec succès');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const userName = user?.first_name || user?.username || 'Utilisateur';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Section Header */}
      <div className="bg-primary-green text-white px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-green-100 text-sm">Mon profil</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Formulaire de profil */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Informations personnelles</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-green hover:underline text-sm font-semibold"
              >
                Modifier
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-green text-white font-bold py-2 rounded-lg hover:bg-dark-green transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Prénom</span>
                <p className="text-gray-800 font-medium">{formData.first_name || 'Non renseigné'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Nom</span>
                <p className="text-gray-800 font-medium">{formData.last_name || 'Non renseigné'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email</span>
                <p className="text-gray-800 font-medium">{formData.email || 'Non renseigné'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Téléphone</span>
                <p className="text-gray-800 font-medium">{formData.phone || 'Non renseigné'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bouton de déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Profile;
