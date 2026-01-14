"""
Tests pour l'app users (Phase 1).
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserRegistrationTests(TestCase):
    """Tests d'inscription utilisateur."""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
    
    def test_register_patient(self):
        """Test d'inscription d'un patient."""
        data = {
            'username': 'patient1',
            'email': 'patient1@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'PATIENT'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['role'], 'PATIENT')
    
    def test_register_doctor(self):
        """Test d'inscription d'un médecin."""
        data = {
            'username': 'doctor1',
            'email': 'doctor1@test.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'role': 'DOCTOR'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'DOCTOR')
    
    def test_register_password_mismatch(self):
        """Test d'inscription avec mots de passe différents."""
        data = {
            'username': 'patient1',
            'email': 'patient1@test.com',
            'password': 'testpass123',
            'password_confirm': 'differentpass',
            'first_name': 'John',
            'last_name': 'Doe',
            'role': 'PATIENT'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTests(TestCase):
    """Tests de connexion utilisateur."""
    
    def setUp(self):
        self.client = APIClient()
        self.login_url = '/api/auth/login/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
    
    def test_login_success(self):
        """Test de connexion réussie."""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
    
    def test_login_wrong_password(self):
        """Test de connexion avec mauvais mot de passe."""
        data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_nonexistent_user(self):
        """Test de connexion avec utilisateur inexistant."""
        data = {
            'username': 'nonexistent',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserPermissionsTests(TestCase):
    """Tests des permissions utilisateur."""
    
    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='patient',
            email='patient@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
        self.doctor = User.objects.create_user(
            username='doctor',
            email='doctor@test.com',
            password='testpass123',
            role=User.Role.DOCTOR
        )
    
    def test_patient_can_view_own_profile(self):
        """Test qu'un patient peut voir son propre profil."""
        self.client.force_authenticate(user=self.patient)
        response = self.client.get(f'/api/users/{self.patient.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_doctor_can_view_all_profiles(self):
        """Test qu'un médecin peut voir tous les profils."""
        self.client.force_authenticate(user=self.doctor)
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Le médecin devrait voir au moins 2 utilisateurs (lui + le patient)
        self.assertGreaterEqual(len(response.data['results']), 2)
    
    def test_patient_cannot_view_other_profiles(self):
        """Test qu'un patient ne peut pas voir le profil d'un autre."""
        other_patient = User.objects.create_user(
            username='other_patient',
            email='other@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
        self.client.force_authenticate(user=self.patient)
        response = self.client.get(f'/api/users/{other_patient.id}/')
        # Devrait être 404 ou 403 selon l'implémentation
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])
