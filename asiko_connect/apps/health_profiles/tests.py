"""
Tests pour l'app health_profiles (Phase 2).
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import HealthProfile, Comorbidity, VaccinationStatus

User = get_user_model()


class HealthProfileCRUDTests(TestCase):
    """Tests CRUD pour HealthProfile."""
    
    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='patient',
            email='patient@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
        self.client.force_authenticate(user=self.patient)
    
    def test_create_health_profile(self):
        """Test de création d'un profil de santé."""
        data = {
            'user': self.patient.id,
            'height': 175,
            'weight': 70,
            'medical_history': 'Aucun antécédent'
        }
        response = self.client.post('/api/health-profiles/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('vulnerability_index', response.data)
    
    def test_get_health_profile(self):
        """Test de récupération d'un profil de santé."""
        profile = HealthProfile.objects.create(
            user=self.patient,
            height=175,
            weight=70
        )
        response = self.client.get(f'/api/health-profiles/{profile.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['height'], 175)
    
    def test_update_health_profile(self):
        """Test de mise à jour d'un profil de santé."""
        profile = HealthProfile.objects.create(
            user=self.patient,
            height=175,
            weight=70
        )
        data = {'weight': 75}
        response = self.client.patch(f'/api/health-profiles/{profile.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        profile.refresh_from_db()
        self.assertEqual(profile.weight, 75)


class VulnerabilityIndexTests(TestCase):
    """Tests de calcul d'indice de vulnérabilité."""
    
    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='patient',
            email='patient@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
        self.client.force_authenticate(user=self.patient)
    
    def test_vulnerability_index_calculation(self):
        """Test du calcul de l'indice de vulnérabilité."""
        profile = HealthProfile.objects.create(
            user=self.patient,
            height=175,
            weight=70
        )
        # Ajouter une comorbidité
        comorbidity = Comorbidity.objects.create(
            health_profile=profile,
            comorbidity_type='ASTHMA',
            is_active=True
        )
        # Calculer l'indice
        index = profile.calculate_vulnerability_index()
        self.assertIsNotNone(index)
        self.assertGreaterEqual(index, 0)
        self.assertLessEqual(index, 100)
    
    def test_vulnerability_index_endpoint(self):
        """Test de l'endpoint de calcul d'indice de vulnérabilité."""
        profile = HealthProfile.objects.create(
            user=self.patient,
            height=175,
            weight=70
        )
        response = self.client.get(f'/api/health-profiles/{profile.id}/vulnerability-index/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('vulnerability_index', response.data)
        self.assertIn('factors', response.data)
    
    def test_vulnerability_index_recalculate(self):
        """Test de recalcul forcé de l'indice de vulnérabilité."""
        profile = HealthProfile.objects.create(
            user=self.patient,
            height=175,
            weight=70
        )
        response = self.client.post(f'/api/health-profiles/{profile.id}/recalculate-vulnerability/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('vulnerability_index', response.data)
