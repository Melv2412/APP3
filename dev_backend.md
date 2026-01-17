# Plan d'Implémentation Backend ASIKO

## Vue d'ensemble

Ce document détaille le plan d'implémentation complet du backend Django REST Framework pour le projet ASIKO (Système Prédictif pour Anticiper la Pneumonie).

## 📊 État Actuel du Projet (Dernière mise à jour)

### ✅ Phases Complètes
- **Phase 0** : Configuration de base ✅
- **Phase 1** : Authentification et Utilisateurs ✅ (User + PatientData)
- **Phase 2** : Profils de Santé ✅ (HealthProfile, Comorbidity, VaccinationStatus)
- **Phase 3** : Données Capteurs IoT + Prédictions IA ✅ (SensorMeasurement + Prediction intégrés, ML local, ViewSets complets)
- **Phase 4** : Données Environnementales ✅ (Modèle + API complète avec endpoints nearby et current)
- **Phase 5** : Alertes ✅ (Modèle + Tasks Celery + Services + API REST complète avec ViewSet complet)
- **Phase 6** : Community (Zones à Risque) ✅ (RiskZone + Services + API REST complète avec endpoints nearby et map)
- **Phase 7** : Treatments (Actions Préventives) ✅ (Modèle + Services + API REST + Intégration avec Alertes)
- **Phase 8** : Dashboard Santé Publique ✅ (API REST agrégée livrée)
- **Phase 9** : Carnet Santé Connecté ✅ (API journal agrégé)
- **Phase 10** : Carnet Santé Connecté ✅ (Frontend complet + Export JSON)

### ❌ Phases Non Démarrées
- **Phase 11** : Optimisations et Finalisation

### 🔄 Repositionnements Majeurs
- **Rôle du Médecin** : Repositionné comme "Acteur de Santé Publique" (voir section Phase 8)
- **Prédictions IA** : Intégrées directement dans Phase 3 (Sensors)

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
- [x] Créer `utils/ai_client.py` (placeholder pour microservice IA externe - non utilisé actuellement)
- [x] Créer `utils/exceptions.py` (exceptions personnalisées)
- [x] Créer `utils/calculs.py` (calculate_trend, calculate_curb65)

---

## Phase 1 : Authentification et Utilisateurs (Semaine 1-2)

### 1.1 Modèle User Personnalisé
- [x] Créer `apps/users/models.py` avec modèle `User` (AbstractUser)
- [x] Champs : rôle (PATIENT, DOCTOR, ADMIN), téléphone, date_naissance, etc.
- [x] Migration : `python manage.py makemigrations users`
- [x] Migration : `python manage.py migrate`
- [x] **BONUS** : Modèle `PatientData` créé (données statiques : âge, smoking, diabetes, copd_asthma, immunosuppression)
- [x] Migrations multiples appliquées (0001, 0002, 0003)

### 1.2 Authentification DRF
- [x] Installer `djangorestframework-simplejwt`
- [x] Configurer JWT dans `settings.py`
- [x] Créer `apps/users/serializers.py` :
  - `UserSerializer`
  - `UserRegistrationSerializer`
  - `LoginSerializer`
  - `PatientDataSerializer`
- [x] Créer `apps/users/views.py` :
  - `UserRegistrationView`
  - `LoginView`
  - `UserProfileView`
  - `UserViewSet`
- [x] Créer `apps/users/permissions.py` :
  - `IsDoctor`, `IsPatient`, `IsOwnerOrDoctor`
- [x] Créer `apps/users/urls.py` avec routes d'auth

### 1.3 Tests
- [x] Tests d'inscription/connexion ✅
  - Fichier : `asiko_connect/apps/users/tests.py`
  - Classes : `UserRegistrationTests`, `UserLoginTests`, `UserPermissionsTests`
- [x] Tests de permissions ✅
  - Fichier : `asiko_connect/apps/users/tests.py`
  - Classe : `UserPermissionsTests`

---

## Phase 2 : Profils de Santé (Semaine 2)

### 🎯 Rôle de la Phase 2 dans le Projet ASIKO

La **Phase 2 : Profils de Santé** est une phase fondamentale qui pose les bases médicales du système **spécifiquement pour la pneumonie**. Elle permet de :

1. **📋 Stocker les Antécédents Médicaux PERTINENTS POUR LA PNEUMONIE** : 
   - Comorbidités qui sont des facteurs de risque de pneumonie (asthme, BPCO, diabète, maladies cardiaques, immunosuppression, etc.)
   - Statut vaccinal contre les infections respiratoires (pneumonie, COVID-19, grippe)
   - Historique médical pertinent UNIQUEMENT pour la prédiction de pneumonie

2. **🔢 Calculer l'Indice de Vulnérabilité à la PNEUMONIE** (Fonctionnalité 1.8) :
   - Score basé sur les facteurs de risque spécifiques à la pneumonie (âge, comorbidités respiratoires, statut vaccinal)
   - Permet de personnaliser le niveau de prévention et d'alerte pour la pneumonie
   - Utilisé pour ajuster les seuils d'alerte et les recommandations préventives contre la pneumonie

3. **🔗 Alimenter les Prédictions IA de PNEUMONIE** (Phase 3) :
   - Les profils de santé peuvent être utilisés comme inputs pour le modèle ML
   - Le modèle ML dans sensors combine : PatientData + SensorMeasurement
   - Les facteurs de risque personnels sont intégrés dans le calcul de probabilité de développer une pneumonie

4. **📊 Fournir des Données au Dashboard Santé Publique** (Phase 8) :
   - Les acteurs de santé publique peuvent consulter des statistiques agrégées (anonymisées)
   - Permet de comprendre les facteurs de risque dans la population

5. **📖 Alimenter le Carnet Santé Connecté** (Phase 9) :
   - Les profils de santé font partie de l'historique complet du patient
   - Permet un suivi longitudinal de l'évolution des facteurs de risque de PNEUMONIE

6. **⚕️ Personnaliser les Alertes et Actions Préventives CONTRE LA PNEUMONIE** (Phases 5 et 7) :
   - Les seuils d'alerte sont ajustés selon la vulnérabilité à la pneumonie
   - Les recommandations préventives sont adaptées au profil médical pour prévenir la pneumonie

**En résumé** : Cette phase crée la "carte d'identité médicale" de chaque patient **spécifiquement pour évaluer le risque de pneumonie**, indispensable pour toutes les fonctionnalités prédictives et préventives d'ASIKO.

---

### 2.1 Modèle HealthProfile
- [x] Créer `apps/health_profiles/models.py` :
  - `HealthProfile` (lié à User via OneToOne)
  - `Comorbidity` (modèle séparé avec types prédéfinis)
  - `VaccinationStatus` (modèle séparé)
  - Indice de vulnérabilité calculé et stocké
- [x] Champs : âge, taille, poids, comorbidités, statut vaccinal, historique médical, facteurs de risque
- [x] Méthode `calculate_vulnerability_index()` avec algorithme complet (0-100)
- [x] Méthode `get_vulnerability_level()` pour niveau textuel
- [x] Propriété `bmi` pour calcul IMC
- [x] Migration créée et appliquée ✅

### 2.2 API HealthProfile
- [x] Serializers : `HealthProfileSerializer`, `ComorbiditySerializer`, `VaccinationStatusSerializer`
- [x] ViewSets avec permissions (patient = own, doctor = all)
- [x] Endpoints :
  - `GET /api/health-profiles/` (liste)
  - `GET /api/health-profiles/{id}/` (détail)
  - `POST /api/health-profiles/` (création)
  - `PATCH /api/health-profiles/{id}/` (mise à jour)
  - `GET /api/health-profiles/{id}/vulnerability-index/` (calcul avec facteurs)
  - `POST /api/health-profiles/{id}/recalculate-vulnerability/` (recalcul forcé)
  - `GET /api/comorbidities/` (liste comorbidités)
  - `GET /api/vaccination-statuses/` (liste statuts vaccinaux)
- [x] Validation des données (âge, taille, poids)
- [x] Calcul automatique de l'indice lors de la création/mise à jour

### 2.3 Tests
- [x] Tests CRUD ✅
  - Fichier : `asiko_connect/apps/health_profiles/tests.py`
  - Classe : `HealthProfileCRUDTests`
- [x] Tests de calcul d'indice de vulnérabilité ✅
  - Fichier : `asiko_connect/apps/health_profiles/tests.py`
  - Classe : `VulnerabilityIndexTests`

---

## Phase 3 : Données Capteurs IoT + Prédictions IA (Semaine 2-3) ✅ COMPLÈTE

### 🤖 Comment l'IA Agit dans cette App

**L'IA est intégrée DIRECTEMENT dans `apps/sensors/` :**

1. **Modèle ML Local** : 
   - Modèle chargé dans `apps/sensors/ml_model.py` (joblib)
   - Fichier : `pneumonia_model.pkl`
   - Format : Scikit-learn model

2. **Flux de Prédiction** :
   - **Étape 1** : Réception données IoT → `POST /api/sensors/measurements/`
   - **Étape 2** : Calculs automatiques (deltas, trends, Curb65)
   - **Étape 3** : Préparation vecteur features (17 features) :
     - PatientData : age, smoking, diabetes, copd_asthma, immunosuppression
     - SensorMeasurement : temperature, respiratory_rate, heart_rate, spo2, systolic_bp, wbc
     - Calculs : curb65, delta_respiratory_rate, delta_spo2, delta_wbc, rr_trend, spo2_trend
   - **Étape 4** : Prédiction ML → `ml_model.predict_proba([X])`
   - **Étape 5** : Stockage → Modèle `Prediction` avec probabilité + niveau de risque
   - **Étape 6** : Retour → Mesure + Prédiction dans la réponse

3. **Résultat** :
   - Probabilité pneumonie dans les 72h (0-1)
   - Niveau de risque (Faible/Modéré/Élevé)
   - Features utilisées pour la prédiction

### 📊 État Réel Actuel

### 3.1 Modèles Sensors + Prédictions (implémentés)
- [x] Modèle `SensorMeasurement` créé dans `apps/sensors/models.py`
- [x] Champs : user, temperature, respiratory_rate, heart_rate, spo2, systolic_bp, wbc
- [x] Calculs automatiques : curb65, delta_respiratory_rate, delta_spo2, delta_wbc, rr_trend, spo2_trend
- [x] Modèle `Prediction` créé dans `apps/sensors/models.py` (INTÉGRÉ dans sensors)
  - Champs : user, input_data (JSONField), result (JSONField), created_at
  - Stocke : probabilité + niveau de risque
- [x] Migration créée et appliquée (0001_initial.py)
- [x] ML model intégré localement (`apps/sensors/ml_model.py` avec joblib)

### 3.2 API Sensors + Prédictions ✅ COMPLÈTE
- [x] Serializer : `SensorMeasurementSerializer` créé ✅
- [x] Serializer : `PredictionSerializer` créé ✅
- [x] View : `SensorMeasurementCreateView` (CreateAPIView) ✅
- [x] ViewSet : `SensorMeasurementViewSet` (ModelViewSet complet) ✅
  - list, retrieve, update, partial_update, delete
  - Action `latest` : GET /api/sensors/measurements/latest/
  - Action `trends` : GET /api/sensors/measurements/trends/
- [x] ViewSet : `PredictionViewSet` (ReadOnlyModelViewSet) ✅
  - list, retrieve
  - Action `latest` : GET /api/sensors/predictions/latest/
- [x] Endpoint : `POST /api/sensors/measurements/` ✅
  - **Fonctionnalité** : Création mesure + Prédiction ML automatique
  - **Retour** : Mesure + Prédiction + Features utilisées
- [x] Endpoints GET :
  - `GET /api/sensors/measurements/` (liste avec filtres) ✅
  - `GET /api/sensors/measurements/{id}/` (détail) ✅
  - `GET /api/sensors/measurements/latest/` (dernière mesure) ✅
  - `GET /api/sensors/measurements/trends/` (tendances sur période) ✅
  - `GET /api/sensors/predictions/` (liste prédictions) ✅
  - `GET /api/sensors/predictions/{id}/` (détail) ✅
  - `GET /api/sensors/predictions/latest/` (dernière prédiction) ✅
- [x] Filtres avancés ✅ :
  - Filtres : user, created_at
  - Filtres date : date_from, date_to (query params)
  - Tri : created_at, temperature, respiratory_rate, spo2
  - Recherche : user__username, user__email
- [x] Permissions : IsOwnerOrDoctor (patients voient leurs données, médecins voient tout) ✅
- [x] Utilitaires : `utils/calculs.py` avec `calculate_trend()` et `calculate_curb65()` ✅
- [x] Fonction `risk_level(prob)` pour déterminer niveau de risque ✅
- [x] URLs configurées dans `asiko_connect/apps/sensors/urls.py` ✅
- [ ] Validation des données (plages acceptables) - Optionnel pour MVP

### 3.3 Gestion Audio Toux
- [ ] Modèle `CoughAudio` :
  - `user`, `audio_file`, `timestamp`, `processed` (bool)
- [ ] Endpoint `POST /api/sensors/cough-audio/` pour upload
- [ ] Stockage dans `media/audio/cough/`
- [ ] Intégration audio dans prédiction ML

### 3.4 Score d'Évolution du Risque
- [ ] Modèle `RiskEvolution` ou champ calculé :
  - user, date, current_score, previous_score, evolution_trend (INCREASING, DECREASING, STABLE), change_percentage
- [ ] Tâche Celery pour calcul périodique (ou calcul à la volée)
- [ ] Endpoint `GET /api/sensors/risk-evolution/`

### 3.5 Tests
- [x] Tests de réception données IoT ✅
  - Fichier : `asiko_connect/apps/sensors/tests.py`
  - Classe : `SensorMeasurementTests`
- [x] Tests de prédiction ML ✅
  - Fichier : `asiko_connect/apps/sensors/tests.py`
  - Classe : `PredictionTests`
- [ ] Tests d'upload audio (optionnel - fonctionnalité future)
- [ ] Tests de filtres et tendances (optionnel - peut être ajouté)

### 🔧 Actions à Faire pour Compléter Phase 3
1. Créer ViewSet complet pour `SensorMeasurement` (list, retrieve, update, delete)
2. Créer ViewSet pour `Prediction` (list, retrieve, latest)
3. Ajouter filtres avancés (date_range, user, type de mesure)
4. Ajouter validation des données (plages physiologiques acceptables)
5. Créer modèle `CoughAudio` et intégrer audio dans prédiction
6. Créer modèle `RiskEvolution` pour suivre l'évolution du risque
7. Ajouter endpoint trends pour analyser tendances

---

## Phase 4 : Données Environnementales (Semaine 3) ✅ COMPLÈTE

### 4.1 Modèle EnvironmentData
- [x] Créer `apps/environment/models.py` :
  - `EnvironmentData` avec location (lat/lng), timestamp, pm25, pm10, no2, humidity, temperature, source
  - Propriété `pollution_level` calculée (0-100)
  - Propriété `pollution_level_text` (Faible/Modéré/Élevé/Très élevé)
- [x] Index sur timestamp et lat/lng
- [x] Migration créée et appliquée ✅

### 4.2 API Environment ✅ COMPLÈTE
- [x] Serializer : `EnvironmentDataSerializer` créé ✅
- [x] Serializer : `EnvironmentDataNearbySerializer` créé ✅
- [x] ViewSet `EnvironmentDataViewSet` avec filtres géographiques et temporels ✅
- [x] Endpoints :
  - `POST /api/environment/` (réception données) ✅
  - `GET /api/environment/` (liste avec filtres) ✅
  - `GET /api/environment/{id}/` (détail) ✅
  - `PUT /api/environment/{id}/` (mise à jour) ✅
  - `DELETE /api/environment/{id}/` (suppression) ✅
  - `GET /api/environment/nearby/` (données proches d'un point) ✅
  - `GET /api/environment/current/{lat}/{lng}/` (données actuelles moyennées sur 24h) ✅
- [x] Filtres : source, latitude, longitude ✅
- [x] Tri : timestamp, pm25, pm10, no2 ✅
- [x] Admin configuré ✅
- [x] URLs configurées dans `asiko_connect/apps/environment/urls.py` ✅

### 4.3 Intégration API Externe (optionnel)
- [ ] Service dans `utils/environment_api.py` pour récupérer données pollution
- [ ] Tâche Celery périodique pour mise à jour automatique

### 4.4 Tests
- [ ] Tests CRUD
- [ ] Tests de filtres géographiques
- [ ] Tests endpoint nearby
- [ ] Tests endpoint current

---

## Phase 5 : Alertes (Semaine 4-5) ✅ COMPLÈTE

### 5.1 Modèle Alert
- [x] Créer `apps/alerts/models.py` :
  - `Alert` créé (structure différente : lié à Sensor avec phases PHASE_1, PHASE_2, PHASE_3)
  - Champs : sensor, phase, is_active, phase_1_started_at, phase_2_started_at, phase_3_started_at
- [x] Migration (si appliquée)
- [x] Admin configuré ✅

### 5.2 Système de Règles
- [ ] Créer `apps/alerts/rules.py` :
  - `check_pollution_threshold()` (non créé)
  - `check_spo2_degradation()` (non créé)
  - `check_abnormal_cough()` (non créé)
  - `check_risk_increase()` (non créé)
- [x] Créer `apps/alerts/services.py` :
  - `compute_average_iqa()` créé ✅

### 5.3 API Alerts ✅ COMPLÈTE
- [x] Serializer : `AlertSerializer` créé ✅ (avec sensor_device_id et measurements_count)
- [x] ViewSet : `AlertViewSet` (ModelViewSet complet) ✅
  - list, retrieve, create, update, partial_update, delete
  - Action `deactivate` : PATCH /api/alerts/{id}/deactivate/
  - Action `active` : GET /api/alerts/active/
  - Action `active_count` : GET /api/alerts/active-count/
- [x] Filtres : sensor, phase, is_active ✅
- [x] Tri : created_at, phase_1_started_at ✅
- [x] Endpoints :
  - [x] `GET /api/alerts/` (liste alertes) ✅
  - [x] `GET /api/alerts/{id}/` (détail) ✅
  - [x] `POST /api/alerts/` (créer alerte) ✅
  - [x] `PATCH /api/alerts/{id}/` (mise à jour partielle) ✅
  - [x] `PATCH /api/alerts/{id}/deactivate/` (désactiver alerte) ✅
  - [x] `GET /api/alerts/active/` (alertes actives) ✅
  - [x] `GET /api/alerts/active-count/` (nombre d'alertes actives) ✅
- [x] URLs configurées dans `asiko_connect/urls.py` ✅

### 5.4 Déclenchement Automatique
- [x] Tâches Celery créées (`phase1_timer_task`, `phase2_timer_task`, `phase3_timer_task`) ✅
- [ ] Signal Django après création `Prediction` (dans sensors) → évaluer alertes (non fait)
- [ ] Tâche Celery périodique pour vérifier seuils (non fait, seulement tasks de transition de phase)

### 5.5 Tests
- [x] Tests de création alertes ✅
  - Fichier : `asiko_connect/apps/alerts/tests.py`
  - Classe : `AlertCRUDTests`
- [ ] Tests de règles de déclenchement (optionnel - dépend des tasks Celery)

### ✅ Phase 5 Complétée
- ViewSet `AlertViewSet` créé ✅
- Endpoints GET/POST/PATCH/DELETE créés ✅
- Actions personnalisées (deactivate, active, active_count) créées ✅
- Filtres et tri configurés ✅
- URLs configurées dans `asiko_connect/urls.py` ✅

---

## Phase 6 : Communauté et Zones à Risque (Semaine 5-6) ✅ COMPLÈTE

### 6.1 Modèle RiskZone ✅
- [x] Créer `apps/community/models.py` : ✅
  - [x] `RiskZone` avec zone (OneToOne avec sensors.Zone), risk_level, pollution_level, respiratory_signal_count, high_risk_predictions_count, last_updated, is_active, radius_meters ✅
- [x] Migration créée et appliquée ✅

### 6.2 Calcul Zones à Risque ✅
- [x] Créer `apps/community/services.py` : ✅
  - [x] `haversine_distance()` (calcul distance GPS) ✅
  - [x] `aggregate_environmental_data(zone)` ✅
  - [x] `aggregate_respiratory_signals(zone)` (basé sur SensorMeasurement et Prediction) ✅
  - [x] `calculate_zone_risk_level()` (LOW/MODERATE/HIGH/CRITICAL) ✅
  - [x] `update_risk_zones()` (mise à jour toutes les zones) ✅
  - [x] `get_nearby_risk_zones()` (zones proches d'un point GPS) ✅

### 6.3 API Community ✅ COMPLÈTE
- [x] Serializer : `RiskZoneSerializer` ✅
- [x] Serializer : `RiskZoneMapSerializer` (simplifié pour carte) ✅
- [x] ViewSet : `RiskZoneViewSet` (ReadOnlyModelViewSet) ✅
- [x] Filtres : risk_level, is_active ✅
- [x] Tri : risk_level, last_updated, pollution_level ✅
- [x] Endpoints : ✅
  - [x] `GET /api/community/risk-zones/` (liste zones) ✅
  - [x] `GET /api/community/risk-zones/{id}/` (détail) ✅
  - [x] `GET /api/community/risk-zones/nearby/?latitude=X&longitude=Y&radius=5000` (zones proches) ✅
  - [x] `GET /api/community/risk-zones/map/` (données pour carte) ✅
  - [x] `POST /api/community/risk-zones/update-all/` (force mise à jour) ✅
- [x] URLs configurées dans `asiko_connect/urls.py` ✅
- [x] Admin configuré ✅

### 6.4 Alertes Communautaires
- [ ] Modèle `CommunityAlert` ou utiliser `Alert` avec `user=None` (optionnel - peut utiliser Alert existant)
- [ ] Déclenchement quand zone atteint seuil critique (optionnel)
- [ ] Endpoint `GET /api/community/alerts/` (alertes communautaires) (optionnel)

### 6.5 Tests
- [ ] Tests de calcul zones à risque (optionnel pour MVP)
- [ ] Tests d'alertes communautaires (optionnel)

---

## Phase 7 : Traitements et Prévention (Semaine 6-7) ✅ COMPLÈTE

### 7.1 Modèles Treatments ✅ COMPLÈTE
- [x] Créer `apps/treatments/models.py` : ✅
  - [x] `PreventionAction` avec user, alert, action_type, recommendation_text, priority, completed, completed_at, created_at ✅
  - [x] Types d'actions : AVOID_ZONE, WEAR_MASK, CHECK_SPO2, CONSULT_DOCTOR, STAY_HOME, HYDRATE, REST, MONITOR_SYMPTOMS, OTHER ✅
  - [x] Priorités : HIGH, MEDIUM, LOW ✅
  - [x] Relation avec Alert (ForeignKey) ✅
- [x] Migration créée ✅

### 7.2 Service Prévention Active ✅ COMPLÈTE
- [x] Créer `apps/treatments/services.py` : ✅
  - [x] `generate_prevention_actions_for_alert(alert)` - Génère des actions pour tous les utilisateurs basées sur une alerte ✅
  - [x] `generate_prevention_actions_for_user(user, prediction, alerts, risk_zones)` - Génère des actions pour un utilisateur spécifique ✅
  - [x] `suggest_actions_based_on_risk(user)` - Suggère des actions basées sur le profil de risque ✅
  - [x] Logique de génération selon les phases d'alerte (Phase 1 = masque, Phase 2 = éviter zone, Phase 3 = évacuation + rester à domicile) ✅

### 7.3 API Treatments ✅ COMPLÈTE
- [x] Serializers : `PreventionActionSerializer` ✅
- [x] ViewSet : `PreventionActionViewSet` avec permissions (patients voient leurs actions, médecins voient tout) ✅
- [x] Endpoints : ✅
  - [x] `GET /api/treatments/prevention-actions/` (liste des actions) ✅
  - [x] `GET /api/treatments/prevention-actions/{id}/` (détail) ✅
  - [x] `POST /api/treatments/prevention-actions/{id}/complete/` (marquer complétée) ✅
  - [x] `GET /api/treatments/prevention-actions/pending/` (actions non complétées) ✅
  - [x] `GET /api/treatments/prevention-actions/priority/` (actions prioritaires) ✅
  - [x] `POST /api/treatments/prevention-actions/generate/` (générer des actions pour l'utilisateur connecté) ✅
- [x] Filtres : action_type, priority, completed, alert ✅
- [x] Tri : par priorité et date ✅

### 7.4 Intégration avec Alertes ✅ COMPLÈTE
- [x] Génération automatique d'actions lors de la création d'une alerte Phase 1 ✅
- [x] Génération automatique d'actions lors du passage Phase 1 → Phase 2 ✅
- [x] Génération automatique d'actions lors du passage Phase 2 → Phase 3 ✅
- [x] Intégration dans `alerts/tasks.py` (tâches Celery) ✅
- [x] Intégration dans `sensors/views.py` (création d'alerte) ✅

### 7.5 Tests
- [ ] Tests de génération actions prévention
- [ ] Tests CRUD actions prévention

---

## Phase 8 : Dashboard Santé Publique (Semaine 7) ✅ API livrée

### 🎯 Rôle : Surveillance de Population (pas consultations individuelles)

**IMPORTANT** : Le médecin/acteur de santé publique n'est plus un "médecin clinicien" mais un **acteur de santé publique** qui surveille la population.

### ⚠️ Rôle Actuel du Médecin (Existant)
- Permission `IsDoctor` créée ✅
- Permission `IsOwnerOrDoctor` : médecins peuvent voir toutes les ressources ✅
- Dans `HealthProfileViewSet` : médecins voient tous les profils ✅
- Dans `UserViewSet` : médecins voient tous les utilisateurs ✅

### 🎯 Nouveau Rôle : Acteur de Santé Publique

**Nouveaux Pouvoirs :**
1. **Surveillance épidémiologique** : Visualise les tendances de population
2. **Détection de clusters** : Identifie les zones à risque communautaire
3. **Cartographie** : Voit la carte des zones de pollution et signaux respiratoires
4. **Alertes communautaires** : Déclenche des alertes pour des zones entières
5. **Validation scientifique** : Peut valider les prédictions IA (feedback loop)

### 8.1 Dashboard Santé Publique
- [x] App `dashboard` branchée dans `urls.py`
- [ ] Modèles/caches optionnels (non requis pour le MVP)

### 8.2 API Dashboard Santé Publique
- [x] `apps/dashboard/serializers.py` (RiskZone, PollutionPoint, TrendPoint)
- [x] `apps/dashboard/views.py` :
  - `PublicHealthStatsView` (stats population, alertes, prédictions 7j, distribution vulnérabilité)
  - `RiskZonesView` (zones à risque actives)
  - `ClustersView` (zones HIGH/CRITICAL)
  - `TrendsView` (tendances 14 jours : prédictions, high risk, alertes)
  - `PollutionMapView` (100 derniers points pollution)
- [x] Endpoints :
  - `GET /api/dashboard/public-health/stats/`
  - `GET /api/dashboard/risk-zones/`
  - `GET /api/dashboard/clusters/`
  - `GET /api/dashboard/trends/`
  - `GET /api/dashboard/pollution-map/`

### 8.3 Permissions
- [x] Protection `IsAuthenticated` + `IsDoctor`
- [ ] (Option) Nouvelle permission/role santé publique si besoin

### 8.4 Fonctionnalités Clés
- [x] Visualisation agrégée (anonymisée) des données de population
- [x] Détection de clusters de risque communautaire
- [x] Cartographie des zones à risque (pollution + signaux respiratoires via RiskZones/PollutionMap)
- [x] Tendances épidémiologiques (14 jours)
- [ ] Alertes communautaires (Phase 6) — optionnel
- [ ] Export de données anonymisées pour recherche (Phase 10)

### 8.5 Tests
- [ ] Tests d'accès dashboard (acteur santé publique uniquement)
- [ ] Tests d'agrégations anonymisées
- [ ] Tests de détection clusters

---

## Phase 9 : Carnet Santé Connecté (Semaine 7-8) ✅ API journal + Frontend complet

### 9.1 Vue Agrégée ✅ COMPLÈTE
- [x] Endpoint `GET /api/dashboard/health-journal/` (app dashboard)
- [x] Serializer(s) : `PredictionEntrySerializer`, `MeasurementEntrySerializer`, `PreventionActionEntrySerializer`, `AlertEntrySerializer`, `EnvironmentEntrySerializer`
- [x] Contenu : prédictions, mesures capteurs, actions prévention, alertes, données environnement (limitées à 100 entrées chacune, filtrage date_from/date_to)
- [x] Permissions : authentifié ; patient voit ses données ; médecin peut cibler un patient via `user_id`

### 9.2 Endpoints ✅ COMPLÈTE
- [x] `GET /api/dashboard/health-journal/` (journal complet)
- [x] `GET /api/dashboard/health-journal/summary/` (résumé période simple)
- [x] `GET /api/dashboard/health-journal/export/` (export JSON simple avec Content-Disposition)

### 9.3 Frontend ✅ COMPLÈTE
- [x] Page `HealthJournal.jsx` complète avec timeline chronologique
- [x] Filtres temporels (7j/30j/90j/tout/plage personnalisée)
- [x] Statistiques de résumé (prédictions, mesures, actions complétées)
- [x] Composants pour afficher prédictions, mesures, actions
- [x] Gestion erreurs et loading states
- [x] Export JSON fonctionnel

### 9.4 Tests
- [ ] Tests d'agrégation données
- [ ] Tests de filtres temporels

---

## Phase 10 : Archivage et Dataset Recherche (Semaine 8) - REPORTÉ

### 10.1 Modèle DatasetExport
- [ ] Créer `apps/research/models.py` :
  - `DatasetExport` avec export_date, data_range_start/end, anonymized, format, file_path, status

### 10.2 Service d'Anonymisation
- [ ] Créer `utils/data_anonymization.py` :
  - Fonction pour anonymiser données (RGPD)
  - Suppression identifiants personnels
  - Généralisation données sensibles

### 10.3 API Research (optionnel, admin uniquement)
- [ ] Endpoints protégés (admin uniquement) :
  - `POST /api/research/export-dataset/` (créer export)
  - `GET /api/research/exports/` (liste exports)
  - `GET /api/research/exports/{id}/download/` (télécharger)

### 10.4 Tests
- [ ] Tests d'anonymisation
- [ ] Tests d'export

---

## Phase 11 : Optimisations et Finalisation (Semaine 8-9) 🔄 EN COURS

### 11.1 Performance
- [ ] Ajouter cache (Redis) pour données fréquentes
- [ ] Optimiser requêtes (select_related, prefetch_related)
- [ ] Pagination sur toutes les listes
- [ ] Index base de données sur champs fréquemment filtrés

### 11.2 Documentation API
- [ ] Configurer `drf-yasg` (Swagger)
- [ ] Documenter tous les endpoints
- [ ] Exemples de requêtes/réponses

### 11.3 Gestion Erreurs
- [ ] Middleware personnalisé pour gestion erreurs
- [ ] Exceptions personnalisées dans `utils/exceptions.py`
- [ ] Messages d'erreur cohérents

### 11.4 Tests Complets
- [ ] Tests unitaires pour chaque app
- [ ] Tests d'intégration pour flux complets
- [ ] Tests de performance (charges)

### 11.5 Sécurité
- [ ] Audit sécurité (OWASP)
- [ ] Validation stricte des entrées
- [ ] Rate limiting sur endpoints sensibles
- [ ] HTTPS en production
- [ ] Audit logs pour actions sensibles

### 11.6 Déploiement
- [ ] Configuration production (`settings/production.py`)
- [ ] Dockerfile et docker-compose
- [ ] Variables d'environnement production
- [ ] Scripts de migration
- [ ] Backup base de données

---

## Ordre de Priorité Recommandé

### MVP (Minimum Viable Product) ✅ COMPLÈTE
1. Phase 0 : Configuration ✅
2. Phase 1 : Authentification ✅
3. Phase 2 : Health Profiles ✅
4. Phase 3 : Sensors + Predictions IA ✅
5. Phase 4 : Environment ✅
6. Phase 5 : Alertes ✅

### V1 Complète ✅ COMPLÈTE
7. Phase 6 : Community (Zones à Risque + Cartographie) ✅
8. Phase 7 : Treatments (Actions Préventives) ✅
9. Phase 8 : Dashboard Santé Publique ✅
10. Phase 9 : Carnet Santé Connecté ✅
11. Phase 10 : Carnet Santé Connecté (Frontend complet) ✅

### V2 - Prochaine étape
12. Phase 11 : Optimisations et Finalisation 🔄 EN COURS

---

## 🎯 Rôle du Médecin dans ASIKO

### ✅ Positionnement : Acteur de Santé Publique

**Le médecin dans ASIKO n'est PAS un médecin clinicien mais un acteur de santé publique :**

**Nouveaux Pouvoirs :**
1. **Surveillance épidémiologique** : Visualise les tendances de population (anonymisées)
2. **Détection de clusters** : Identifie les zones à risque communautaire
3. **Cartographie** : Voit la carte des zones de pollution et signaux respiratoires
4. **Alertes communautaires** : Déclenche des alertes pour des zones entières
5. **Validation scientifique** : Peut valider les prédictions IA (feedback loop)
6. **Coordination** : Peut coordonner avec autorités sanitaires

**Ce qu'il NE fait PAS :**
- ❌ Pas de consultations individuelles
- ❌ Pas de suivi de patients individuels
- ❌ Pas de diagnostic ou traitement

**Pourquoi c'est mieux pour PRÉVENTION/PRÉDICTION :**
1. ✅ **Intervention AVANT** : Détecte les risques AVANT qu'ils se développent
2. ✅ **Impact collectif** : Protège des populations entières, pas juste un patient
3. ✅ **Différenciation** : Vision "santé publique" vs "santé individuelle"
4. ✅ **Hackathon** : Montre compréhension des enjeux épidémiologiques
5. ✅ **Innovation** : Surveillance prédictive de population = nouveau concept

### 🎯 Message pour le Jury du Hackathon

**"ASIKO est un système de prévention et prédiction à deux niveaux :**
- **Niveau individuel** : Le patient reçoit des prédictions personnalisées et des actions préventives
- **Niveau population** : Les acteurs de santé publique surveillent les zones à risque et détectent les clusters épidémiologiques

C'est la différence entre une app de santé individuelle et un **système de santé publique intelligent**."**

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