"""
Tests pour l'app alerts (Phase 5).
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from .models import Alert
from asiko_connect.apps.sensors.models import Sensor, Zone

User = get_user_model()


class AlertCRUDTests(TestCase):
    """Tests CRUD pour Alert."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='user',
            email='user@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
        self.client.force_authenticate(user=self.user)
        
        # Créer un capteur et une zone pour les tests
        self.zone = Zone.objects.create(name='Zone Test')
        self.sensor = Sensor.objects.create(device_id='sensor001', zone=self.zone)
    
    def test_create_alert(self):
        """Test de création d'une alerte."""
        data = {
            'sensor': self.sensor.id,
            'phase': Alert.PHASE_1,
            'is_active': True,
            'phase_1_started_at': timezone.now().isoformat()
        }
        response = self.client.post('/api/alerts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['phase'], Alert.PHASE_1)
    
    def test_list_alerts(self):
        """Test de liste des alertes."""
        Alert.objects.create(
            sensor=self.sensor,
            phase=Alert.PHASE_1,
            is_active=True,
            phase_1_started_at=timezone.now()
        )
        response = self.client.get('/api/alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
    
    def test_get_alert_detail(self):
        """Test de récupération d'une alerte."""
        alert = Alert.objects.create(
            sensor=self.sensor,
            phase=Alert.PHASE_1,
            is_active=True,
            phase_1_started_at=timezone.now()
        )
        response = self.client.get(f'/api/alerts/{alert.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phase'], Alert.PHASE_1)
    
    def test_deactivate_alert(self):
        """Test de désactivation d'une alerte."""
        alert = Alert.objects.create(
            sensor=self.sensor,
            phase=Alert.PHASE_1,
            is_active=True,
            phase_1_started_at=timezone.now()
        )
        response = self.client.patch(f'/api/alerts/{alert.id}/deactivate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        alert.refresh_from_db()
        self.assertFalse(alert.is_active)
    
    def test_get_active_alerts(self):
        """Test de récupération des alertes actives."""
        Alert.objects.create(
            sensor=self.sensor,
            phase=Alert.PHASE_1,
            is_active=True,
            phase_1_started_at=timezone.now()
        )
        Alert.objects.create(
            sensor=self.sensor,
            phase=Alert.PHASE_1,
            is_active=False,
            phase_1_started_at=timezone.now()
        )
        response = self.client.get('/api/alerts/active/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Devrait retourner uniquement les alertes actives
        self.assertTrue(all(alert['is_active'] for alert in response.data))
    
    def test_get_active_count(self):
        """Test de comptage des alertes actives."""
        Alert.objects.create(
            sensor=self.sensor,
            phase=Alert.PHASE_1,
            is_active=True,
            phase_1_started_at=timezone.now()
        )
        Alert.objects.create(
            sensor=self.sensor,
            phase=Alert.PHASE_1,
            is_active=False,
            phase_1_started_at=timezone.now()
        )
        response = self.client.get('/api/alerts/active-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
