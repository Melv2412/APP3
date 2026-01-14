"""
Tests pour l'app sensors (Phase 3).
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import SensorMeasurement, Prediction
from asiko_connect.apps.users.models import PatientData

User = get_user_model()


class SensorMeasurementTests(TestCase):
    """Tests de réception des données IoT."""
    
    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='patient',
            email='patient@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
        # Créer PatientData pour le patient
        PatientData.objects.create(
            user=self.patient,
            age=35,
            smoking=False,
            diabetes=False,
            copd_asthma=False,
            immunosuppression=False
        )
        self.client.force_authenticate(user=self.patient)
    
    def test_create_sensor_measurement(self):
        """Test de création d'une mesure de capteur."""
        data = {
            'user': self.patient.id,
            'temperature': 37.0,
            'respiratory_rate': 18.0,
            'heart_rate': 75.0,
            'spo2': 98.0,
            'systolic_bp': 120.0,
            'wbc': 7.0
        }
        response = self.client.post('/api/sensors/measurements/', data, format='json')
        # Le endpoint POST peut retourner 201 ou 503 si le modèle ML n'est pas disponible
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_503_SERVICE_UNAVAILABLE])
        if response.status_code == status.HTTP_201_CREATED:
            self.assertIn('measurement', response.data)
            self.assertIn('prediction', response.data)
    
    def test_list_sensor_measurements(self):
        """Test de liste des mesures de capteur."""
        SensorMeasurement.objects.create(
            user=self.patient,
            temperature=37.0,
            respiratory_rate=18.0,
            heart_rate=75.0,
            spo2=98.0,
            systolic_bp=120.0,
            wbc=7.0
        )
        response = self.client.get('/api/sensors/measurements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
    
    def test_get_latest_measurement(self):
        """Test de récupération de la dernière mesure."""
        SensorMeasurement.objects.create(
            user=self.patient,
            temperature=37.0,
            respiratory_rate=18.0,
            heart_rate=75.0,
            spo2=98.0,
            systolic_bp=120.0,
            wbc=7.0
        )
        response = self.client.get('/api/sensors/measurements/latest/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['temperature'], 37.0)


class PredictionTests(TestCase):
    """Tests des prédictions ML."""
    
    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='patient',
            email='patient@test.com',
            password='testpass123',
            role=User.Role.PATIENT
        )
        self.client.force_authenticate(user=self.patient)
    
    def test_list_predictions(self):
        """Test de liste des prédictions."""
        Prediction.objects.create(
            user=self.patient,
            input_data=[35, 0, 0, 0, 0, 37.0, 18.0, 75.0, 98.0, 120.0, 7.0, 0, 0, 0, 0, 0, 0],
            result={'probabilite_pneumonie_72h': 0.15, 'niveau_risque': 'FAIBLE'}
        )
        response = self.client.get('/api/sensors/predictions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
    
    def test_get_latest_prediction(self):
        """Test de récupération de la dernière prédiction."""
        Prediction.objects.create(
            user=self.patient,
            input_data=[35, 0, 0, 0, 0, 37.0, 18.0, 75.0, 98.0, 120.0, 7.0, 0, 0, 0, 0, 0, 0],
            result={'probabilite_pneumonie_72h': 0.15, 'niveau_risque': 'FAIBLE'}
        )
        response = self.client.get('/api/sensors/predictions/latest/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('probabilite_pneumonie_72h', response.data)
        self.assertIn('niveau_risque', response.data)
