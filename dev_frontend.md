# Plan d'Implémentation Frontend React.js ASIKO

## Vue d'ensemble

Ce document détaille le plan d'implémentation complet du frontend React.js pour le projet ASIKO (Système Prédictif pour Anticiper la Pneumonie), basé sur les maquettes Figma et intégré avec le backend Django REST Framework.

## 📊 État Actuel du Projet (Dernière mise à jour)

### ✅ Phases Complètes
- **Phase 0** : Configuration et Setup React.js ✅
- **Phase 1** : Configuration de base (Design System, Routing, Services API) ✅
- **Phase 2** : Authentification (Login, Register, Account Type Selection) ✅

### ❌ Phases Non Démarrées
- **Phase 3** : Dashboard Patient (Accueil User)
- **Phase 4** : Prédictions IA et Données Capteurs
- **Phase 5** : Alertes
- **Phase 6** : Cartographie et Zones à Risque
- **Phase 7** : Actions Préventives
- **Phase 8** : Profil de Santé
- **Phase 9** : Dashboard Médecin (Santé Publique)
- **Phase 10** : Carnet Santé Connecté
- **Phase 11** : Optimisations et Finalisation

### 🔄 Modifications depuis Figma

**Écrans Figma à Supprimer :**
- ❌ Message avec médecin (chat) - Télémédecine supprimée du backend
- ❌ Historique consultations - Remplacé par "Historique Prédictions"
- ❌ Agenda/Rendez-vous - Pas dans le backend
- ❌ Services en ligne (Pharmacy, Physiotherapy, Shop) - Pas d'API backend (peut rester comme liens externes)

**Écrans Figma à Transformer :**
- ⚠️ "Espace docteur" → "Mon Profil de Santé" (utilise HealthProfile au lieu de médecin assigné)
- ⚠️ "Historique" → "Historique de Prédictions" (utilise Prediction au lieu de consultations)

**Écrans à Créer (manquants dans Figma) :**
- ➕ Page Prédictions IA
- ➕ Page Alertes
- ➕ Page Actions Préventives
- ➕ Page Zones à Risque / Carte complète
- ➕ Page Données Capteurs
- ➕ Page Carnet Santé
- ➕ Dashboard Santé Publique (pour médecin)

---

## Phase 0 : Configuration de Base React.js (Semaine 1)

### 0.1 Setup Projet
- [x] Créer projet Vite + React (JavaScript)
- [x] Installer dépendances de base
- [x] Installer packages nécessaires :
  - [x] `axios` (appels API) ✅
  - [x] `react-router-dom` (routing) ✅
  - [x] `tailwindcss` + `postcss` + `autoprefixer` (styling) ✅
  - [ ] `react-leaflet` ou `@react-google-maps/api` (cartographie) - à installer plus tard
  - [ ] `recharts` ou `chart.js` (graphiques) - à installer plus tard
  - [ ] `date-fns` (gestion dates) - à installer plus tard

### 0.2 Structure des Dossiers
- [ ] Créer structure :
  ```
  src/
  ├── assets/           # Images, icônes
  ├── components/       # Composants réutilisables
  │   ├── common/      # Boutons, Inputs, Cards
  │   └── layout/      # Header, Footer, Nav
  ├── pages/           # Pages de l'application
  ├── services/        # Appels API vers backend
  ├── context/         # Context API (Auth, Theme)
  ├── hooks/           # Custom hooks
  ├── utils/           # Utilitaires
  ├── styles/          # CSS globaux, variables
  └── App.jsx
  ```

### 0.3 Configuration Base
- [x] Configurer Tailwind CSS ✅
  - [x] Créer `tailwind.config.js` avec couleurs ASIKO ✅
  - [x] Créer `postcss.config.js` ✅
  - [x] Configurer `index.css` avec directives Tailwind ✅
- [x] Configurer variables d'environnement (`.env` - à créer manuellement)
  - `VITE_API_BASE_URL=http://localhost:8000/api`
- [ ] Configurer Vite proxy si nécessaire
- [ ] Configurer ESLint/Prettier (optionnel)

---

## Phase 1 : Configuration de Base (Semaine 1)

### 1.1 Design System

#### Palette de Couleurs
- [x] Définir couleurs dans `tailwind.config.js` ✅
  - `primary-green: #00A651`
  - `dark-green: #008040`
  - `light-green: #B8E6B8`
  - `asiko-red: #FF0000` (alerts, risque)
  - `asiko-blue: #0066FF` (highlights, active states)
  - `asiko-gray: #CCCCCC` (inactive, texte secondaire)
  - `asiko-gray-dark: #666666`

#### Typographie
- [x] Définir hiérarchie dans `tailwind.config.js` ✅
  - Titre principal : Gras, vert, 24-32px (heading-xl, heading-lg)
  - Sous-titres : Gras, noir, 18-20px (heading-md, heading-sm)
  - Corps : Normal, noir, 14-16px (body-lg, body-md)
  - Boutons : Gras, blanc, 16px (body-lg)

#### Composants de Base
- [x] Créer `Button` (primaire, secondaire, carré) ✅
- [x] Créer `Input` (text, email, password) ✅
- [x] Créer `Card` (container arrondi) ✅
- [x] Créer `Badge` (notifications) ✅

### 1.2 Routing
- [x] Installer et configurer `react-router-dom` ✅
- [x] Créer routes principales (routes de base) ✅ :
  - [x] `/login` ✅
  - [x] `/register` ✅
  - [x] `/register/type` (sélection type compte) ✅
  - [ ] `/dashboard` (patient) - À créer en Phase 3
  - [ ] `/dashboard/doctor` (médecin) - À créer en Phase 9
  - [ ] `/predictions` - À créer en Phase 4
  - [ ] `/alerts` - À créer en Phase 5
  - [ ] `/map` (zones à risque) - À créer en Phase 6
  - [ ] `/health-profile` - À créer en Phase 8
  - [ ] `/sensors` - À créer en Phase 4
  - [ ] `/journal` (carnet santé) - À créer en Phase 10
  - [ ] `/actions` (actions préventives) - À créer en Phase 7

### 1.3 Services API
- [x] Créer `src/services/api.js` ✅
  - Instance axios configurée
  - Intercepteur pour token JWT
  - Gestion erreurs 401

- [x] Créer services spécifiques ✅ :
  - [x] `src/services/auth.js` (login, register) ✅
  - [x] `src/services/users.js` (profil utilisateur) ✅
  - [x] `src/services/healthProfiles.js` (profil de santé) ✅
  - [x] `src/services/sensors.js` (capteurs + prédictions) ✅
  - [x] `src/services/environment.js` (données environnementales) ✅
  - [x] `src/services/alerts.js` (alertes) ✅
  - [x] `src/services/community.js` (zones à risque) ✅
  - [x] `src/services/treatments.js` (actions préventives) ✅
  - [x] `src/services/dashboard.js` (dashboard santé publique) ✅

### 1.4 Context API
- [x] Créer `src/context/AuthContext.js` ✅ :
  - Gestion authentification (token, user, login, logout) ✅
  - Vérification token valide ✅
  - Chargement utilisateur depuis localStorage ✅

- [ ] Créer `src/context/ThemeContext.js` (optionnel)

### 1.5 Layout Components
- [x] Créer `Header` (avec menu hamburger, notifications) ✅
- [x] Créer `BottomNav` (navigation mobile) ✅
- [x] Créer `Layout` (wrapper avec Header + BottomNav) ✅
- [ ] Créer `Sidebar` (menu latéral, optionnel desktop)

---

## Phase 2 : Authentification (Semaine 1-2)

### 2.1 Page Login
- [x] Créer `src/pages/Login.jsx` ✅
- [x] Formulaire :
  - [x] Input Email ✅
  - [x] Input Password ✅
  - [x] Checkbox "Remember me" ✅
  - [x] Lien "Forgot password" ✅
  - [x] Bouton "Connexion" (vert, arrondi) ✅
  - [x] Lien "Don't have an account? Register" ✅
  - [x] Social login (Facebook, Apple, Google) ✅
- [x] Appel API : `POST /api/auth/login/` ✅
- [x] Stockage token JWT dans localStorage ✅
- [x] Redirection vers dashboard après login ✅

### 2.2 Page Register (Sélection Type Compte)
- [x] Créer `src/pages/RegisterType.jsx` ✅
- [x] Deux cartes pour sélection :
  - [x] Carte "user/patient" (vert plein) ✅
  - [x] Carte "professionals" (vert clair) ✅
- [x] Bouton "continue" ✅
- [x] Lien "Already have an account? login" ✅
- [x] Redirection vers formulaire d'inscription avec type sélectionné ✅

### 2.3 Page Inscription (Formulaire)
- [x] Créer `src/pages/Register.jsx` ✅
- [x] Formulaire :
  - [x] Input "Nom et Prénom" ✅
  - [x] Input "Lieu de fonction" (ex: ESATIC) ✅
  - [x] Input "E-mail" ✅
  - [x] Input "fonction" (ex: Étudiant) ✅
  - [x] Checkbox "Agree to terms and privacy policy" ✅
  - [x] Icône cœur (visuel) ✅
  - [x] Bouton "Inscription" (vert) ✅
- [x] Appel API : `POST /api/auth/register/` ✅
- [x] Validation formulaire ✅
- [x] Redirection vers login après inscription ✅

### 2.4 Protected Routes
- [x] Créer `ProtectedRoute` component ✅
- [x] Vérifier token JWT ✅
- [x] Rediriger vers login si non authentifié ✅
- [x] Gérer permissions (patient vs doctor) ✅

### 2.5 Tests
- [ ] Tests de connexion/déconnexion
- [ ] Tests de redirection

---

## Phase 3 : Dashboard Patient (Semaine 2) ✅ COMPLÈTE

### 3.1 Page Accueil User
- [x] Créer `src/pages/Dashboard.jsx` ✅
- [ ] Header :
  - Menu hamburger (gauche)
  - "Asikoconect" (centre, vert)
  - Upload icon + Notifications (droite)

- [ ] Section Welcome Banner :
  - Photo de profil circulaire
  - "Welcome back! [Nom utilisateur]"
  - Fond vert

- [ ] Section "Ma localisation" (Widget Carte) :
  - [ ] Composant `MapWidget`
  - Carte interactive (React Leaflet ou Google Maps)
  - Cercle vert avec point bleu (position utilisateur)
  - Texte "sain" dans le cercle
  - Texte "Qualité de l'air: [Excellente/Bonne/Modérée/Mauvaise]"
  - Légende : Point vert "Sain", Point rouge "Risque"
  - Appel API : `GET /api/environment/current/{lat}/{lng}/`

- [ ] Section "facteurs autour & services" :
  - [ ] Trois boutons carrés verts :
    - "facteurs" (icône soleil)
    - "Hôpitaux Généraux" (icône H)
    - "Centres de pneumologies" (icône cœur/poumons)
  - [ ] Tabs : "services en ligne", "service 24x7", "Autres services"
  - [ ] Boutons services (optionnel, liens externes) :
    - HommeCall, Pharmacy, Physiotherapy, Shop

- [ ] Section Prédiction Actuelle (À AJOUTER) :
  - [ ] Widget prédiction
  - Probabilité pneumonie 72h
  - Niveau de risque (Faible/Modéré/Élevé)
  - Appel API : `GET /api/sensors/predictions/latest/`

- [ ] Bottom Navigation :
  - [ ] Composant `BottomNav`
  - Icônes : Home (actif), Stats, Cart, Heart, Profile

### 3.2 Layout Dashboard
- [ ] Wrapper avec Header + BottomNav
- [ ] Scrollable content
- [ ] Gestion responsive

### 3.3 Tests
- [ ] Tests d'affichage dashboard
- [ ] Tests de widget carte

---

## Phase 4 : Prédictions IA et Données Capteurs (Semaine 2-3) ✅ COMPLÈTE

### 4.1 Page Prédictions IA
- [x] Créer `src/pages/Predictions.jsx` ✅
- [x] Section Prédiction Actuelle : ✅
  - Carte grande avec probabilité (0-100%)
  - Niveau de risque (Faible/Modéré/Élevé) avec couleur
  - Fenêtre de prédiction (72h)
  - Date de dernière prédiction
  - Appel API : `GET /api/sensors/predictions/latest/`

- [x] Section Historique Prédictions : ✅
  - Liste des prédictions (remplace "Historique consultations")
  - Filtres : dernière semaine, mois, année
  - Appel API : `GET /api/sensors/predictions/`
  - [x] Graphique évolution probabilité dans le temps (Recharts) ✅

- [x] Section Facteurs Explicatifs : ✅
  - Liste des facteurs utilisés (features)
  - ⚠️ Contribution de chaque facteur (non implémenté, dépend du backend)

- [ ] Section Score d'Évolution du Risque :
  - ⚠️ API `/api/sensors/risk-evolution/` non disponible dans le backend
  - Tendance (INCREASING, DECREASING, STABLE)
  - Pourcentage de changement
  - Graphique tendance

### 4.2 Page Données Capteurs
- [x] Créer `src/pages/Sensors.jsx` ✅
- [x] Section Mesures Actuelles : ✅
  - SpO₂
  - Température
  - Rythme respiratoire
  - Fréquence cardiaque
  - Tension artérielle
  - WBC
  - Appel API : `GET /api/sensors/measurements/latest/` ✅

- [x] Section Historique : ✅
  - Liste des dernières mesures (10 dernières)
  - Affichage des tendances (rr_trend, spo2_trend)

- [x] Section Graphiques : ✅
  - [x] Graphiques temporels (Recharts) ✅
  - [x] Evolution SpO₂ ✅
  - [x] Evolution température ✅
  - [x] Evolution rythme respiratoire ✅

- [ ] Section Upload Audio Toux :
  - ⚠️ API `/api/sensors/cough-audio/` non disponible dans le backend
  - Bouton upload fichier audio
  - Liste des enregistrements

### 4.3 Composants Réutilisables
- [ ] Créer `PredictionCard` (carte de prédiction)
- [ ] Créer `SensorValueCard` (valeur capteur avec graphique)
- [ ] Créer `RiskLevelBadge` (badge niveau de risque)
- [ ] Créer `LineChart` (graphique évolution)

### 4.4 Tests
- [ ] Tests d'affichage prédictions
- [ ] Tests de graphiques

---

## Phase 5 : Alertes (Semaine 3) ✅ COMPLÈTE

### 5.1 Page Alertes
- [x] Créer `src/pages/Alerts.jsx` ✅
- [x] Header avec badge nombre actives ✅
- [x] Liste des alertes : ✅
  - [x] Carte alerte avec :
    - Phase (PHASE_1, PHASE_2, PHASE_3) avec couleur ✅
    - Statut (Active/Inactive) ✅
    - Capteur device ID ✅
    - Date/heure de création ✅
    - Dates de démarrage des phases ✅
    - Bouton "Désactiver l'alerte" ✅
  - Filtres : Actives, Toutes ✅
  - Tri : Plus récentes (backend) ✅
- [x] Appel API : `GET /api/alerts/alerts/` ✅
- [x] Appel API : `PATCH /api/alerts/alerts/{id}/deactivate/` ✅
- [x] Appel API : `GET /api/alerts/alerts/active-count/` ✅
- [x] Service `alerts.js` mis à jour ✅

### 5.2 Composant Notification Bell
- [ ] Créer `NotificationBell` component
- [ ] Badge rouge avec nombre non lues
- [ ] Dropdown liste alertes récentes
- [ ] Lien vers page Alertes complète

### 5.3 Alertes Communautaires
- [ ] Section alertes communautaires (si user=None)
- [ ] Affichage spécial pour alertes de zone

### 5.4 Tests
- [ ] Tests d'affichage alertes
- [ ] Tests de marquer comme lue

---

## Phase 6 : Cartographie et Zones à Risque (Semaine 3-4)

### 6.1 Widget Carte (Dashboard)
- [ ] Composant `MapWidget` pour accueil (déjà dans Phase 3)
- [ ] Affichage position GPS utilisateur
- [ ] Affichage qualité de l'air actuelle
- [ ] Légende sain/risque

### 6.2 Page Carte Complète
- [ ] Créer `src/pages/Map.jsx`
- [ ] Carte plein écran
- [ ] Intégration bibliothèque (React Leaflet recommandé) :
  - [ ] Installer `react-leaflet` et `leaflet`
  - [ ] Configurer tiles (OpenStreetMap ou autre)
- [ ] Affichage zones :
  - [ ] Zones vertes (saines)
  - [ ] Zones rouges (à risque)
  - [ ] Cercles avec niveau de risque
  - [ ] Popups avec détails zone
- [ ] Appel API : `GET /api/community/risk-zones/nearby/`
- [ ] Appel API : `GET /api/community/risk-map/`

### 6.3 Marqueurs et Layers
- [ ] Marqueur position utilisateur (cercle vert + point bleu)
- [ ] Layer zones de risque (polygones ou cercles)
- [ ] Layer pollution (heatmap ou cercles colorés)
- [ ] Légende interactive

### 6.4 Filtres Carte
- [ ] Toggle : Afficher/Masquer zones à risque
- [ ] Toggle : Afficher/Masquer pollution
- [ ] Slider : Rayon de recherche
- [ ] Filtre : Niveau de risque (Faible, Modéré, Élevé)

### 6.5 Tests
- [ ] Tests d'affichage carte
- [ ] Tests de filtres

---

## Phase 7 : Actions Préventives (Semaine 4)

### 7.1 Page Actions Préventives
- [ ] Créer `src/pages/PreventionActions.jsx`
- [ ] Liste des actions recommandées :
  - [ ] Carte action avec :
    - Type d'action (icône)
    - Texte recommandation
    - Priorité (Haute, Moyenne, Basse)
    - Statut : À faire / Complétée
    - Bouton "Marquer comme complétée"
    - Date de création
  - Filtres : Toutes, À faire, Complétées, Par priorité
- [ ] Appel API : `GET /api/treatments/prevention-actions/`
- [ ] Appel API : `POST /api/treatments/prevention-actions/{id}/complete/`

### 7.2 Widget Actions (Dashboard)
- [ ] Widget sur accueil avec 3 actions prioritaires
- [ ] Lien vers page complète

### 7.3 Tests
- [ ] Tests d'affichage actions
- [ ] Tests de complétion action

---

## Phase 8 : Profil de Santé (Semaine 4)

### 8.1 Page Profil de Santé
- [ ] Créer `src/pages/HealthProfile.jsx`
- [ ] Transformer "Espace docteur" en "Mon Profil de Santé"
- [ ] Section Informations Personnelles :
  - Âge, Taille, Poids
  - IMC calculé
  - Statut tabagique
  - Consommation d'alcool
- [ ] Section Indice de Vulnérabilité :
  - Score (0-100) avec barre de progression
  - Niveau textuel (Très faible, Faible, Modéré, Élevé, Très élevé)
  - Bouton "Recalculer"
  - Facteurs expliqués
- [ ] Section Comorbidités :
  - Liste des comorbidités sélectionnées
  - Bouton "Ajouter comorbidité"
  - Appel API : `GET /api/comorbidities/`
- [ ] Section Statuts Vaccinaux :
  - Liste des vaccinations
  - Bouton "Ajouter vaccination"
  - Appel API : `GET /api/vaccination-statuses/`
- [ ] Appel API : `GET /api/health-profiles/` (profil utilisateur)
- [ ] Appel API : `POST /api/health-profiles/` (création)
- [ ] Appel API : `PATCH /api/health-profiles/{id}/` (mise à jour)

### 8.2 Formulaire Profil
- [ ] Créer composant formulaire avec validation
- [ ] Champs : taille, poids, statut tabagique, etc.
- [ ] Sélection multiple comorbidités
- [ ] Sélection multiple vaccinations

### 8.3 Tests
- [ ] Tests d'affichage profil
- [ ] Tests de mise à jour profil

---

## Phase 9 : Dashboard Médecin (Santé Publique) (Semaine 5)

### 9.1 Page Dashboard Médecin
- [ ] Créer `src/pages/DashboardDoctor.jsx`
- [ ] Header similaire patient
- [ ] Section Welcome Banner (avec nom médecin)
- [ ] Section Statistiques Population :
  - Nombre total de patients
  - Nombre de patients à risque élevé
  - Répartition des niveaux de risque (graphique)
  - Appel API : `GET /api/dashboard/public-health/stats/`

- [ ] Section Zones à Risque :
  - Liste des zones actives
  - Niveau de risque par zone
  - Nombre de signaux respiratoires
  - Appel API : `GET /api/dashboard/risk-zones/`

- [ ] Section Clusters :
  - Détection de clusters de risque
  - Carte avec clusters
  - Appel API : `GET /api/dashboard/clusters/`

- [ ] Section Tendances Épidémiologiques :
  - Graphiques tendances
  - Evolution temporelle
  - Appel API : `GET /api/dashboard/trends/`

### 9.2 Carte Santé Publique
- [ ] Section carte pollution (plein écran ou widget)
- [ ] Affichage zones polluées
- [ ] Affichage clusters respiratoires
- [ ] Appel API : `GET /api/dashboard/pollution-map/`

### 9.3 Permissions
- [ ] Vérifier que seul DOCTOR peut accéder
- [ ] Redirection si PATIENT accède

### 9.4 Tests
- [ ] Tests d'accès (doctor seulement)
- [ ] Tests d'affichage statistiques

---

## Phase 10 : Carnet Santé Connecté (Semaine 5)

### 10.1 Page Carnet Santé
- [ ] Créer `src/pages/HealthJournal.jsx`
- [ ] Vue agrégée de toutes les données :
  - Timeline verticale ou liste chronologique
  - Prédictions (avec date, probabilité)
  - Données capteurs (avec graphiques mini)
  - Données environnementales (qualité de l'air)
  - Alertes déclenchées
  - Actions préventives complétées
- [ ] Filtres temporels :
  - Dernière semaine
  - Dernier mois
  - Dernière année
  - Personnalisé (date_from, date_to)
- [ ] Appel API : `GET /api/health-journal/`

### 10.2 Section Résumé
- [ ] Page résumé période
- [ ] Statistiques agrégées
- [ ] Graphiques synthétiques
- [ ] Appel API : `GET /api/health-journal/summary/`

### 10.3 Export
- [ ] Bouton "Exporter"
- [ ] Options : PDF ou JSON
- [ ] Appel API : `GET /api/health-journal/export/`

### 10.4 Tests
- [ ] Tests d'affichage carnet
- [ ] Tests de filtres temporels

---

## Phase 11 : Optimisations et Finalisation (Semaine 6)

### 11.1 Performance
- [ ] Lazy loading des routes
- [ ] Memoization des composants lourds
- [ ] Optimisation des images
- [ ] Code splitting

### 11.2 Gestion d'Erreurs
- [ ] Composant ErrorBoundary
- [ ] Messages d'erreur utilisateur-friendly
- [ ] Gestion erreurs API (toast notifications)

### 11.3 Loading States
- [ ] Skeleton loaders
- [ ] Spinners pour actions
- [ ] États de chargement cohérents

### 11.4 Responsive Design
- [ ] Mobile-first approach
- [ ] Breakpoints (mobile, tablet, desktop)
- [ ] Navigation adaptée (bottom nav mobile, sidebar desktop)

### 11.5 Accessibilité
- [ ] Alt text pour images
- [ ] ARIA labels
- [ ] Navigation clavier
- [ ] Contraste couleurs (WCAG)

### 11.6 Tests
- [ ] Tests unitaires (Jest + React Testing Library)
- [ ] Tests d'intégration
- [ ] Tests E2E (optionnel, Cypress)

---

## Design System Complet

### Couleurs (Variables CSS)
```css
:root {
  /* Primary Colors */
  --primary-green: #00A651;
  --dark-green: #008040;
  --light-green: #B8E6B8;
  
  /* Neutral Colors */
  --white: #FFFFFF;
  --black: #000000;
  --gray-light: #F5F5F5;
  --gray: #CCCCCC;
  --gray-dark: #666666;
  
  /* Semantic Colors */
  --red: #FF0000;        /* Alerts, Risque */
  --blue: #0066FF;       /* Highlights, Active */
  --yellow: #FFCC00;     /* Warning */
  --green-light: #90EE90; /* Success */
}
```

### Typographie
```css
/* Headings */
--font-heading-size-xl: 32px;
--font-heading-size-lg: 24px;
--font-heading-size-md: 20px;
--font-heading-size-sm: 18px;

/* Body */
--font-body-size-lg: 16px;
--font-body-size-md: 14px;
--font-body-size-sm: 12px;

/* Weights */
--font-weight-bold: 700;
--font-weight-semibold: 600;
--font-weight-normal: 400;
```

### Composants Styles
- [ ] Boutons : Arrondis 8-12px, padding généreux
- [ ] Inputs : Bordure verte fine, focus vert plus foncé
- [ ] Cards : Fond blanc, ombre légère, arrondi 12px
- [ ] Badges : Arrondi complet, petit padding

---

## Intégration avec Backend Django

### Endpoints API Utilisés

#### Authentification (Phase 1)
- `POST /api/users/register/`
- `POST /api/users/login/`
- `GET /api/users/me/`

#### Profils de Santé (Phase 2)
- `GET /api/health-profiles/`
- `POST /api/health-profiles/`
- `PATCH /api/health-profiles/{id}/`
- `GET /api/comorbidities/`
- `GET /api/vaccination-statuses/`

#### Capteurs et Prédictions (Phase 3)
- `GET /api/sensors/measurements/`
- `GET /api/sensors/predictions/`
- `GET /api/sensors/predictions/latest/`
- `GET /api/sensors/risk-evolution/`

#### Environnement (Phase 4)
- `GET /api/environment/current/{lat}/{lng}/`
- `GET /api/environment/nearby/`

#### Alertes (Phase 5)
- `GET /api/alerts/`
- `GET /api/alerts/unread-count/`
- `PATCH /api/alerts/{id}/mark-read/`

#### Zones à Risque (Phase 6)
- `GET /api/community/risk-zones/nearby/`
- `GET /api/community/risk-map/`

#### Actions Préventives (Phase 7)
- `GET /api/treatments/prevention-actions/`
- `POST /api/treatments/prevention-actions/{id}/complete/`

#### Dashboard Santé Publique (Phase 8)
- `GET /api/dashboard/public-health/stats/`
- `GET /api/dashboard/risk-zones/`
- `GET /api/dashboard/clusters/`
- `GET /api/dashboard/trends/`
- `GET /api/dashboard/pollution-map/`

#### Carnet Santé (Phase 9)
- `GET /api/health-journal/`
- `GET /api/health-journal/summary/`
- `GET /api/health-journal/export/`

---

## Ordre de Priorité Recommandé

### MVP (Minimum Viable Product)
1. Phase 0 : Configuration ✅
2. Phase 1 : Configuration de base (Design System, Routing, Services)
3. Phase 2 : Authentification
4. Phase 3 : Dashboard Patient (avec widget carte basique)
5. Phase 4 : Prédictions IA

### V1 Complète
6. Phase 5 : Alertes
7. Phase 6 : Cartographie complète
8. Phase 7 : Actions Préventives
9. Phase 8 : Profil de Santé

### V2
10. Phase 9 : Dashboard Médecin
11. Phase 10 : Carnet Santé
12. Phase 11 : Optimisations

---

## Checklist Finale Avant Production

- [ ] Toutes les pages créées
- [ ] Tous les composants réutilisables créés
- [ ] Toutes les intégrations API testées
- [ ] Design System cohérent appliqué
- [ ] Responsive design vérifié
- [ ] Gestion d'erreurs complète
- [ ] Loading states partout
- [ ] Accessibilité vérifiée
- [ ] Tests écrits
- [ ] Performance optimisée
- [ ] Documentation composants (Storybook optionnel)
