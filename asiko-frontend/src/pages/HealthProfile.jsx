/**
 * Page Profil de Santé
 * Gestion du profil médical avec indice de vulnérabilité, comorbidités et vaccinations
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getHealthProfile,
  createHealthProfile,
  updateHealthProfile,
  recalculateVulnerability,
  getComorbidities,
  getVaccinationStatuses,
} from '../services/healthProfiles';

const HealthProfile = () => {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState(null);
  const [comorbidities, setComorbidities] = useState([]);
  const [vaccinationStatuses, setVaccinationStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    smoking_status: 'NEVER',
    alcohol_consumption: 'NONE',
    medical_history: '',
    selected_comorbidities: [],
    selected_vaccinations: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer le profil de santé
        try {
          const profiles = await getHealthProfile();
          // L'API peut retourner une liste ou un objet unique
          const profile = Array.isArray(profiles) && profiles.length > 0 
            ? profiles[0] 
            : (profiles.results && profiles.results.length > 0 ? profiles.results[0] : profiles);
          
          if (profile && profile.id) {
            setHealthProfile(profile);
            setFormData({
              age: profile.age || '',
              height: profile.height || '',
              weight: profile.weight || '',
              smoking_status: profile.smoking_status || 'NEVER',
              alcohol_consumption: profile.alcohol_consumption || 'NONE',
              medical_history: profile.medical_history || '',
              selected_comorbidities: profile.comorbidities || [],
              selected_vaccinations: profile.vaccination_statuses || [],
            });
          }
        } catch (err) {
          // Pas de profil existant, on pourra en créer un
          console.log('Aucun profil de santé trouvé');
        }

        // Récupérer les listes de comorbidités et vaccinations disponibles
        try {
          const [comorbData, vaccData] = await Promise.all([
            getComorbidities(),
            getVaccinationStatuses(),
          ]);
          
          const comorbList = Array.isArray(comorbData) ? comorbData : (comorbData.results || []);
          const vaccList = Array.isArray(vaccData) ? vaccData : (vaccData.results || []);
          
          setComorbidities(comorbList);
          setVaccinationStatuses(vaccList);
        } catch (err) {
          console.error('Erreur lors du chargement des listes', err);
        }
      } catch (err) {
        setError('Erreur lors du chargement du profil de santé');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleComorbidityToggle = (comorbidityId) => {
    setFormData(prev => {
      const current = prev.selected_comorbidities || [];
      const isSelected = current.some(c => (c.id || c) === (comorbidityId.id || comorbidityId));
      
      if (isSelected) {
        return {
          ...prev,
          selected_comorbidities: current.filter(c => (c.id || c) !== (comorbidityId.id || comorbidityId)),
        };
      } else {
        return {
          ...prev,
          selected_comorbidities: [...current, comorbidityId],
        };
      }
    });
  };

  const handleVaccinationToggle = (vaccinationId) => {
    setFormData(prev => {
      const current = prev.selected_vaccinations || [];
      const isSelected = current.some(v => (v.id || v) === (vaccinationId.id || vaccinationId));
      
      if (isSelected) {
        return {
          ...prev,
          selected_vaccinations: current.filter(v => (v.id || v) !== (vaccinationId.id || vaccinationId)),
        };
      } else {
        return {
          ...prev,
          selected_vaccinations: [...current, vaccinationId],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const profileData = {
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        smoking_status: formData.smoking_status,
        alcohol_consumption: formData.alcohol_consumption,
        medical_history: formData.medical_history,
        comorbidity_ids: formData.selected_comorbidities.map(c => c.id || c),
        vaccination_status_ids: formData.selected_vaccinations.map(v => v.id || v),
      };

      let updatedProfile;
      if (healthProfile && healthProfile.id) {
        updatedProfile = await updateHealthProfile(healthProfile.id, profileData);
      } else {
        updatedProfile = await createHealthProfile(profileData);
      }

      setHealthProfile(updatedProfile);
      setSuccess('Profil de santé mis à jour avec succès');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  const handleRecalculateVulnerability = async () => {
    if (!healthProfile || !healthProfile.id) {
      setError('Veuillez d\'abord créer un profil de santé');
      return;
    }

    try {
      setError('');
      const result = await recalculateVulnerability(healthProfile.id);
      
      // Rafraîchir le profil
      const updated = await getHealthProfile();
      const profile = Array.isArray(updated) && updated.length > 0 
        ? updated[0] 
        : (updated.results && updated.results.length > 0 ? updated.results[0] : updated);
      
      setHealthProfile(profile);
      setSuccess('Indice de vulnérabilité recalculé avec succès');
    } catch (err) {
      setError('Erreur lors du recalcul de l\'indice de vulnérabilité');
      console.error(err);
    }
  };

  // Calculer l'IMC
  const calculateBMI = () => {
    if (formData.height && formData.weight && formData.height > 0) {
      const heightM = parseFloat(formData.height) / 100;
      const bmi = parseFloat(formData.weight) / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  // Obtenir le niveau de vulnérabilité
  const getVulnerabilityLevel = (index) => {
    if (!index) return 'Non calculé';
    if (index >= 70) return 'Très élevé';
    if (index >= 50) return 'Élevé';
    if (index >= 30) return 'Modéré';
    if (index >= 15) return 'Faible';
    return 'Très faible';
  };

  // Obtenir la couleur du niveau de vulnérabilité
  const getVulnerabilityColor = (index) => {
    if (!index) return 'bg-gray-100 text-gray-600';
    if (index >= 70) return 'bg-red-100 text-red-800';
    if (index >= 50) return 'bg-orange-100 text-orange-800';
    if (index >= 30) return 'bg-yellow-100 text-yellow-800';
    if (index >= 15) return 'bg-green-100 text-green-800';
    return 'bg-green-50 text-green-700';
  };

  // Obtenir le texte du statut tabagique
  const getSmokingStatusText = (status) => {
    const statuses = {
      'NEVER': 'Jamais',
      'FORMER': 'Ancien fumeur',
      'CURRENT': 'Fumeur actuel',
    };
    return statuses[status] || status;
  };

  // Obtenir le texte de la consommation d'alcool
  const getAlcoholText = (consumption) => {
    const types = {
      'NONE': 'Aucune',
      'OCCASIONAL': 'Occasionnelle',
      'REGULAR': 'Régulière',
      'HEAVY': 'Importante',
    };
    return types[consumption] || consumption;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  const bmi = calculateBMI();
  const vulnerabilityIndex = healthProfile?.vulnerability_index || null;
  const vulnerabilityLevel = getVulnerabilityLevel(vulnerabilityIndex);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Section Header */}
      <div className="bg-primary-green text-white px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'H'}
          </div>
          <div>
            <h2 className="text-xl font-bold">Mon Profil de Santé</h2>
            <p className="text-green-100 text-sm">Gestion de votre profil médical</p>
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

        {/* Section Indice de Vulnérabilité */}
        {healthProfile && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Indice de Vulnérabilité</h3>
              <button
                onClick={handleRecalculateVulnerability}
                className="text-primary-green hover:underline text-sm font-semibold"
              >
                Recalculer
              </button>
            </div>
            
            {vulnerabilityIndex !== null ? (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary-green mb-2">
                    {vulnerabilityIndex.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">Score sur 100</div>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getVulnerabilityColor(vulnerabilityIndex)}`}>
                    {vulnerabilityLevel}
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      vulnerabilityIndex >= 70 ? 'bg-red-500' :
                      vulnerabilityIndex >= 50 ? 'bg-orange-500' :
                      vulnerabilityIndex >= 30 ? 'bg-yellow-500' :
                      vulnerabilityIndex >= 15 ? 'bg-green-500' :
                      'bg-green-300'
                    }`}
                    style={{ width: `${Math.min(vulnerabilityIndex, 100)}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  Plus le score est élevé, plus vous êtes vulnérable à la pneumonie
                </p>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>L'indice de vulnérabilité sera calculé après la création du profil</p>
              </div>
            )}
          </div>
        )}

        {/* Section Informations Personnelles */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Informations Personnelles</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-primary-green hover:underline text-sm font-semibold"
              >
                {healthProfile ? 'Modifier' : 'Créer mon profil'}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Âge
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    max="150"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                </div>

                {bmi && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IMC
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-semibold">
                      {bmi}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut tabagique
                </label>
                <select
                  name="smoking_status"
                  value={formData.smoking_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                >
                  <option value="NEVER">Jamais</option>
                  <option value="FORMER">Ancien fumeur</option>
                  <option value="CURRENT">Fumeur actuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consommation d'alcool
                </label>
                <select
                  name="alcohol_consumption"
                  value={formData.alcohol_consumption}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                >
                  <option value="NONE">Aucune</option>
                  <option value="OCCASIONAL">Occasionnelle</option>
                  <option value="REGULAR">Régulière</option>
                  <option value="HEAVY">Importante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Historique médical
                </label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  placeholder="Historique médical général..."
                />
              </div>

              {/* Section Comorbidités */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comorbidités
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {comorbidities.length > 0 ? (
                    comorbidities.map((comorbidity) => {
                      const isSelected = formData.selected_comorbidities.some(
                        c => (c.id || c) === (comorbidity.id || comorbidity)
                      );
                      return (
                        <label
                          key={comorbidity.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleComorbidityToggle(comorbidity)}
                            className="w-4 h-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {comorbidity.name_display || comorbidity.name || comorbidity.get_name_display?.() || 'Comorbidité'}
                            {comorbidity.severity && ` (${comorbidity.severity_display || comorbidity.get_severity_display?.() || comorbidity.severity})`}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">Aucune comorbidité disponible</p>
                  )}
                </div>
              </div>

              {/* Section Vaccinations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statuts Vaccinaux
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {vaccinationStatuses.length > 0 ? (
                    vaccinationStatuses.map((vaccination) => {
                      const isSelected = formData.selected_vaccinations.some(
                        v => (v.id || v) === (vaccination.id || vaccination)
                      );
                      return (
                        <label
                          key={vaccination.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleVaccinationToggle(vaccination)}
                            className="w-4 h-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {vaccination.vaccine_type_display || vaccination.vaccine_type || vaccination.get_vaccine_type_display?.() || 'Vaccination'}
                            {vaccination.is_vaccinated && ' ✓ Vacciné'}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">Aucun statut vaccinal disponible</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-green text-white font-bold py-2 rounded-lg hover:bg-dark-green transition-colors"
                >
                  {healthProfile ? 'Enregistrer' : 'Créer le profil'}
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
                <span className="text-sm text-gray-600">Âge</span>
                <p className="text-gray-800 font-medium">{healthProfile?.age || 'Non renseigné'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Taille</span>
                <p className="text-gray-800 font-medium">
                  {healthProfile?.height ? `${healthProfile.height} cm` : 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Poids</span>
                <p className="text-gray-800 font-medium">
                  {healthProfile?.weight ? `${healthProfile.weight} kg` : 'Non renseigné'}
                </p>
              </div>
              {healthProfile?.bmi && (
                <div>
                  <span className="text-sm text-gray-600">IMC</span>
                  <p className="text-gray-800 font-medium">{healthProfile.bmi}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-600">Statut tabagique</span>
                <p className="text-gray-800 font-medium">
                  {healthProfile ? getSmokingStatusText(healthProfile.smoking_status) : 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Consommation d'alcool</span>
                <p className="text-gray-800 font-medium">
                  {healthProfile ? getAlcoholText(healthProfile.alcohol_consumption) : 'Non renseigné'}
                </p>
              </div>
              {healthProfile?.medical_history && (
                <div>
                  <span className="text-sm text-gray-600">Historique médical</span>
                  <p className="text-gray-800 font-medium">{healthProfile.medical_history}</p>
                </div>
              )}
              
              {/* Comorbidités sélectionnées */}
              {healthProfile?.comorbidities && healthProfile.comorbidities.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Comorbidités</span>
                  <div className="mt-1 space-y-1">
                    {healthProfile.comorbidities.map((comorbidity, index) => (
                      <span
                        key={comorbidity.id || index}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-2 mb-1"
                      >
                        {comorbidity.name_display || comorbidity.name || comorbidity.get_name_display?.() || 'Comorbidité'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vaccinations sélectionnées */}
              {healthProfile?.vaccination_statuses && healthProfile.vaccination_statuses.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Statuts Vaccinaux</span>
                  <div className="mt-1 space-y-1">
                    {healthProfile.vaccination_statuses.map((vaccination, index) => (
                      <span
                        key={vaccination.id || index}
                        className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-2 mb-1"
                      >
                        {vaccination.vaccine_type_display || vaccination.vaccine_type || vaccination.get_vaccine_type_display?.() || 'Vaccination'}
                        {vaccination.is_vaccinated && ' ✓'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthProfile;
