/**
 * Service API pour les utilisateurs
 */
import api from './api';

/**
 * Obtenir le profil de l'utilisateur connecté
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/profile/');
  return response.data;
};

/**
 * Mettre à jour le profil utilisateur
 */
export const updateUserProfile = async (userData) => {
  const response = await api.patch('/auth/profile/', userData);
  return response.data;
};

/**
 * Changer le mot de passe
 */
export const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
  const response = await api.post('/users/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
    new_password_confirm: newPasswordConfirm || newPassword, // Si non fourni, utiliser newPassword
  });
  return response.data;
};
