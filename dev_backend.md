# Plan d'Implémentation Backend ASIKO

## Vue d'ensemble

Ce document détaille le plan d'implémentation complet du backend Django REST Framework pour le projet ASIKO (Système Prédictif pour Anticiper la Pneumonie).

---

## Phase 0 : Configuration de Base (Semaine 1)

### 0.1 Configuration Django Complète
- [x] Créer `core/settings/` avec `base.py`, `development.py`, `production.py`
- [x] Configurer base de données (PostgreSQL recommandé)
- [x] Ajouter Django REST Framework dans `INSTALLED_APPS`
- [x] Configurer CORS (`django-cors-headers`)
- [x] Configurer gestion des médias (`MEDIA_ROOT`, `MEDIA_URL`)
- [x] Variables d'environnement (`.env` avec `python-decouple` ou `django-environ`)
- [x] Configuration de sécurité (SECRET_KEY, ALLOWED_HOSTS, CSRF, etc.)

### 0.2 Dépendances
- [x] Mettre à jour `requirements.txt` avec toutes les dépendances nécessaires

### 0.3 Structure utils/
- [x] Créer `asiko_connect/utils/`
- [x] Créer `utils/__init__.py`
- [x] Créer `utils/ai_client.py` (placeholder pour microservice IA)
- [x] Créer `utils/exceptions.py` (exceptions personnalisées)

---

## Phase 1 : Authentification et Utilisateurs (Semaine 1-2)

### 1.1 Modèle User Personnalisé
- [x] Créer `apps/users/models.py` avec modèle `User` (AbstractUser)
- [x] Champs : rôle (PATIENT, DOCTOR, ADMIN), téléphone, date_naissance, etc.
- [x] Migration : `python manage.py makemigrations users`
- [x] Migration : `python manage.py migrate`

### 1.2 Authentification DRF
- [x] Installer `djangorestframework-simplejwt`
- [x] Configurer JWT dans `settings.py`
- [x] Créer `apps/users/serializers.py` :
  - `UserSerializer`
  - `UserRegistrationSerializer`
  - `LoginSerializer`
- [x] Créer `apps/users/views.py` :
  - `UserRegistrationView`
  - `LoginView`
  - `UserProfileView`
- [x] Créer `apps/users/permissions.py` :
  - `IsDoctor`, `IsPatient`, `IsOwnerOrDoctor`
- [x] Créer `apps/users/urls.py` avec routes d'auth

### 1.3 Tests
- [ ] Tests d'inscription/connexion
- [ ] Tests de permissions

---

## Phase 2 : Profils de Santé (Semaine 2)

### 2.1 Modèle HealthProfile
- [ ] Créer `apps/health_profiles/models.py` :
  - `HealthProfile` (lié à User)
  - `Comorbidity` (modèle séparé ou JSONField)
  - `VaccinationStatus`
  - `VulnerabilityIndex` (calculé ou stocké)
- [ ] Champs : âge, comorbidités, statut vaccinal, historique médical
- [ ] Méthode `calculate_vulnerability_index()`
- [ ] Migration

### 2.2 API HealthProfile
- [ ] Serializer : `HealthProfileSerializer`
- [ ] ViewSet avec permissions (patient = own, doctor = all)
- [ ] Endpoints :
  - `GET /api/health-profiles/` (liste)
  - `GET /api/health-profiles/{id}/` (détail)
  - `POST /api/health-profiles/` (création)
  - `PATCH /api/health-profiles/{id}/` (mise à jour)
  - `GET /api/health-profiles/{id}/vulnerability-index/` (calcul)

### 2.3 Tests
- [ ] Tests CRUD
- [ ] Tests de calcul d'indice de vulnérabilité

---

## Phase 3 : Données Capteurs IoT (Semaine 2-3)

### 3.1 Modèle SensorData
- [ ] Créer `apps/sensors/models.py` :
  - `SensorData` avec champs : user, timestamp, spo2, respiratory_rate, heart_rate, hrv, cough_count, device_id
- [ ] Index sur `user` et `timestamp` pour performances
- [ ] Migration

### 3.2 API Sensors
- [ ] Serializer : `SensorDataSerializer`
- [ ] ViewSet avec filtres (date, user, type de données)
- [ ] Endpoints :
  - `POST /api/sensors/` (réception données IoT)
  - `GET /api/sensors/` (liste avec filtres)
  - `GET /api/sensors/{id}/` (détail)
  - `GET /api/sensors/trends/` (tendances sur période)
- [ ] Validation des données (plages acceptables)

### 3.3 Gestion Audio Toux
- [ ] Modèle `CoughAudio` :
  - `user`, `audio_file`, `timestamp`, `processed` (bool)
- [ ] Endpoint `POST /api/sensors/cough-audio/` pour upload
- [ ] Stockage dans `media/audio/cough/`
- [ ] Lien avec `SensorData` (cough_count)

### 3.4 Tests
- [ ] Tests de réception données IoT
- [ ] Tests d'upload audio
- [ ] Tests de filtres et tendances

---

## Phase 4 : Données Environnementales (Semaine 3)

### 4.1 Modèle EnvironmentData
- [ ] Créer `apps/environment/models.py` :
  - `EnvironmentData` avec location (PointField GeoDjango ou lat/lng), timestamp, pm25, pm10, no2, humidity, temperature, source
- [ ] Index géographique si GeoDjango
- [ ] Migration

### 4.2 API Environment
- [ ] Serializer : `EnvironmentDataSerializer`
- [ ] ViewSet avec filtres géographiques et temporels
- [ ] Endpoints :
  - `POST /api/environment/` (réception données)
  - `GET /api/environment/` (liste avec filtres)
  - `GET /api/environment/nearby/` (données proches d'un point)
  - `GET /api/environment/current/{lat}/{lng}/` (données actuelles)

### 4.3 Intégration API Externe (optionnel)
- [ ] Service dans `utils/environment_api.py` pour récupérer données pollution
- [ ] Tâche Celery périodique pour mise à jour automatique

### 4.4 Tests
- [ ] Tests CRUD
- [ ] Tests de filtres géographiques

---

## Phase 5 : Prédictions IA (Semaine 3-4)

### 5.1 Modèle Prediction
- [ ] Créer `apps/predictions/models.py` :
  - `Prediction` avec user, timestamp, probability, confidence_interval_lower/upper, prediction_window_days, factors (JSONField), input_data_snapshot, ai_model_version
- [ ] Migration

### 5.2 Client Microservice IA
- [ ] Créer `utils/ai_client.py` :
  - fonction `call_ai_microservice(audio_file, sensor_data, env_data, health_profile)`
  - gestion erreurs et timeouts
  - parsing réponse (probabilité, facteurs, etc.)
- [ ] Configuration URL microservice dans `.env`

### 5.3 API Predictions
- [ ] Serializer : `PredictionSerializer`
- [ ] ViewSet avec permissions
- [ ] Endpoints :
  - `POST /api/predictions/audio/` (traitement audio + prédiction)
  - `GET /api/predictions/` (historique prédictions)
  - `GET /api/predictions/{id}/` (détail)
  - `GET /api/predictions/latest/` (dernière prédiction)
- [ ] Logique dans `views.py` :
  1. Recevoir audio
  2. Récupérer données récentes (sensors, env, health)
  3. Appeler microservice IA
  4. Sauvegarder prédiction
  5. Déclencher alertes si nécessaire

### 5.4 Score d'Évolution du Risque
- [ ] Modèle `RiskEvolution` ou champ calculé :
  - user, date, current_score, previous_score, evolution_trend (INCREASING, DECREASING, STABLE), change_percentage
- [ ] Tâche Celery pour calcul périodique
- [ ] Endpoint `GET /api/predictions/risk-evolution/`

### 5.5 Tests
- [ ] Tests d'appel microservice IA (mock)
- [ ] Tests de création prédiction
- [ ] Tests de calcul évolution risque

---

## Phase 6 : Alertes (Semaine 4-5)

### 6.1 Modèle Alert
- [ ] Créer `apps/alerts/models.py` :
  - `Alert` avec user (nullable pour alertes communautaires), alert_type, severity, message, timestamp, read, action_taken, related_prediction, related_zone
- [ ] Migration

### 6.2 Système de Règles
- [ ] Créer `apps/alerts/rules.py` :
  - `check_pollution_threshold()`
  - `check_spo2_degradation()`
  - `check_abnormal_cough()`
  - `check_risk_increase()`
- [ ] Créer `apps/alerts/services.py` :
  - `evaluate_and_create_alerts(user, prediction, sensor_data, env_data)`

### 6.3 API Alerts
- [ ] Serializer : `AlertSerializer`
- [ ] ViewSet avec filtres (type, sévérité, lues/non lues)
- [ ] Endpoints :
  - `GET /api/alerts/` (liste alertes utilisateur)
  - `GET /api/alerts/{id}/` (détail)
  - `PATCH /api/alerts/{id}/mark-read/` (marquer comme lue)
  - `GET /api/alerts/unread-count/` (nombre non lues)

### 6.4 Déclenchement Automatique
- [ ] Signal Django après création `Prediction` → évaluer alertes
- [ ] Tâche Celery périodique pour vérifier seuils

### 6.5 Tests
- [ ] Tests de création alertes
- [ ] Tests de règles de déclenchement

---

## Phase 7 : Communauté et Zones à Risque (Semaine 5-6)

### 7.1 Modèle RiskZone
- [ ] Créer `apps/community/models.py` :
  - `RiskZone` avec name, location (PointField ou PolygonField), risk_level, pollution_level, respiratory_signal_count, last_updated, is_active
- [ ] Migration avec GeoDjango si nécessaire

### 7.2 Calcul Zones à Risque
- [ ] Créer `apps/community/services.py` :
  - `aggregate_environmental_data(zone)`
  - `aggregate_respiratory_signals(zone)`
  - `calculate_zone_risk_level(zone)`
  - `update_risk_zones()` (tâche périodique)

### 7.3 API Community
- [ ] Serializer : `RiskZoneSerializer`
- [ ] ViewSet avec filtres géographiques
- [ ] Endpoints :
  - `GET /api/community/risk-zones/` (liste zones)
  - `GET /api/community/risk-zones/{id}/` (détail)
  - `GET /api/community/risk-zones/nearby/` (zones proches)
  - `GET /api/community/risk-map/` (données pour carte)

### 7.4 Alertes Communautaires
- [ ] Modèle `CommunityAlert` ou utiliser `Alert` avec `user=None`
- [ ] Déclenchement quand zone atteint seuil critique
- [ ] Endpoint `GET /api/community/alerts/` (alertes communautaires)

### 7.5 Tests
- [ ] Tests de calcul zones à risque
- [ ] Tests d'alertes communautaires

---

## Phase 8 : Télémédecine (Semaine 6)

### 8.1 Modèles Telemedicine
- [ ] Créer `apps/telemedicine/models.py` :
  - `Consultation` avec patient, doctor, date_scheduled, status, notes, shared_predictions (ManyToMany), diagnosis, recommendations
  - `ConsultationMessage` (chat) avec consultation, sender, message, timestamp
- [ ] Migration

### 8.2 API Telemedicine
- [ ] Serializers : `ConsultationSerializer`, `ConsultationMessageSerializer`
- [ ] ViewSets avec permissions (patient = own, doctor = assigned)
- [ ] Endpoints :
  - `GET /api/telemedicine/consultations/` (liste)
  - `POST /api/telemedicine/consultations/` (créer)
  - `GET /api/telemedicine/consultations/{id}/` (détail)
  - `POST /api/telemedicine/consultations/{id}/messages/` (chat)
  - `POST /api/telemedicine/consultations/{id}/share-predictions/` (partager prédictions)

### 8.3 Tests
- [ ] Tests CRUD consultations
- [ ] Tests de permissions

---

## Phase 9 : Traitements et Prévention (Semaine 6-7)

### 9.1 Modèles Treatments
- [ ] Créer `apps/treatments/models.py` :
  - `Treatment` avec user, name, description, start_date, end_date, status
  - `TreatmentReminder` avec treatment, reminder_time, message, sent
  - `PreventionAction` avec user, action_type, recommendation_text, priority, created_at, completed
- [ ] Migration

### 9.2 Service Prévention Active
- [ ] Créer `apps/treatments/services.py` :
  - `generate_prevention_actions(user, prediction, alerts, risk_zones)`
  - `suggest_actions_based_on_risk()`

### 9.3 API Treatments
- [ ] Serializers : `TreatmentSerializer`, `PreventionActionSerializer`
- [ ] ViewSets
- [ ] Endpoints :
  - `GET /api/treatments/prevention-actions/` (actions recommandées)
  - `POST /api/treatments/prevention-actions/{id}/complete/` (marquer complétée)
  - `GET /api/treatments/` (traitements)
  - `GET /api/treatments/reminders/` (rappels)

### 9.4 Tests
- [ ] Tests de génération actions prévention
- [ ] Tests CRUD traitements

---

## Phase 10 : Dashboard Médecin (Semaine 7)

### 10.1 Modèles Dashboard (si nécessaire)
- [ ] Créer `apps/dashboard/models.py` si besoin de cache/agrégations
- [ ] Sinon, utiliser vues agrégées uniquement

### 10.2 API Dashboard
- [ ] Créer `apps/dashboard/serializers.py` :
  - `DashboardStatsSerializer`
  - `PatientOverviewSerializer`
- [ ] Créer `apps/dashboard/views.py` :
  - `DoctorDashboardView` (vue agrégée)
  - `PatientDetailView` (détail patient avec toutes données)
  - `TrendsAnalysisView` (analyse tendances)
- [ ] Endpoints :
  - `GET /api/dashboard/stats/` (statistiques générales)
  - `GET /api/dashboard/patients/` (liste patients)
  - `GET /api/dashboard/patients/{id}/overview/` (vue complète patient)
  - `GET /api/dashboard/trends/{patient_id}/` (tendances patient)
  - `GET /api/dashboard/predictions/` (prédictions avec filtres)

### 10.3 Permissions
- [ ] Permission `IsDoctor` pour tous les endpoints dashboard

### 10.4 Tests
- [ ] Tests d'accès dashboard (médecin uniquement)
- [ ] Tests d'agrégations

---

## Phase 11 : Carnet Santé Connecté (Semaine 7-8)

### 11.1 Vue Agrégée
- [ ] Créer endpoint `GET /api/health-journal/` dans `apps/users/` ou nouvelle app
- [ ] Serializer `HealthJournalSerializer` qui agrège :
  - Prédictions
  - Données capteurs (tendances)
  - Données environnementales
  - Alertes
  - Actions prévention
- [ ] Filtres temporels (date_from, date_to)

### 11.2 Endpoints
- [ ] `GET /api/health-journal/` (carnet complet)
- [ ] `GET /api/health-journal/summary/` (résumé période)
- [ ] `GET /api/health-journal/export/` (export PDF/JSON)

### 11.3 Tests
- [ ] Tests d'agrégation données
- [ ] Tests de filtres temporels

---

## Phase 12 : Archivage et Dataset Recherche (Semaine 8)

### 12.1 Modèle DatasetExport
- [ ] Créer `apps/predictions/models.py` (ou nouvelle app `research/`) :
  - `DatasetExport` avec export_date, data_range_start/end, anonymized, format, file_path, status

### 12.2 Service d'Anonymisation
- [ ] Créer `utils/data_anonymization.py` :
  - Fonction pour anonymiser données (RGPD)
  - Suppression identifiants personnels
  - Généralisation données sensibles

### 12.3 API Research (optionnel, admin uniquement)
- [ ] Endpoints protégés (admin uniquement) :
  - `POST /api/research/export-dataset/` (créer export)
  - `GET /api/research/exports/` (liste exports)
  - `GET /api/research/exports/{id}/download/` (télécharger)

### 12.4 Tests
- [ ] Tests d'anonymisation
- [ ] Tests d'export

---

## Phase 13 : Optimisations et Finalisation (Semaine 8-9)

### 13.1 Performance
- [ ] Ajouter cache (Redis) pour données fréquentes
- [ ] Optimiser requêtes (select_related, prefetch_related)
- [ ] Pagination sur toutes les listes
- [ ] Index base de données sur champs fréquemment filtrés

### 13.2 Documentation API
- [ ] Configurer `drf-yasg` (Swagger)
- [ ] Documenter tous les endpoints
- [ ] Exemples de requêtes/réponses

### 13.3 Gestion Erreurs
- [ ] Middleware personnalisé pour gestion erreurs
- [ ] Exceptions personnalisées dans `utils/exceptions.py`
- [ ] Messages d'erreur cohérents

### 13.4 Tests Complets
- [ ] Tests unitaires pour chaque app
- [ ] Tests d'intégration pour flux complets
- [ ] Tests de performance (charges)

### 13.5 Sécurité
- [ ] Audit sécurité (OWASP)
- [ ] Validation stricte des entrées
- [ ] Rate limiting sur endpoints sensibles
- [ ] HTTPS en production
- [ ] Audit logs pour actions sensibles

### 13.6 Déploiement
- [ ] Configuration production (`settings/production.py`)
- [ ] Dockerfile et docker-compose
- [ ] Variables d'environnement production
- [ ] Scripts de migration
- [ ] Backup base de données

---

## Ordre de Priorité Recommandé

### MVP (Minimum Viable Product) - Semaines 1-4
1. Phase 0 : Configuration ✅
2. Phase 1 : Authentification ✅
3. Phase 2 : Health Profiles
4. Phase 3 : Sensors
5. Phase 4 : Environment
6. Phase 5 : Predictions (core)

### V1 Complète - Semaines 5-8
7. Phase 6 : Alertes
8. Phase 7 : Community
9. Phase 8 : Telemedicine
10. Phase 9 : Treatments
11. Phase 10 : Dashboard

### V2 - Semaines 9+
12. Phase 11 : Health Journal
13. Phase 12 : Research/Archiving
14. Phase 13 : Optimisations

---

## Checklist Finale Avant Production

- [ ] Tous les modèles migrés
- [ ] Tous les endpoints testés
- [ ] Permissions configurées correctement
- [ ] Documentation API complète
- [ ] Tests de charge effectués
- [ ] Sécurité auditée
- [ ] Variables d'environnement configurées
- [ ] Monitoring et logs en place
- [ ] Backup automatique configuré
- [ ] Documentation technique rédigée

