# Architecture des Données - AsikoConnect

## 📋 Répartition des Données entre les Modèles

### 1. **Modèle `User`** (Informations de base)
**Localisation :** `asiko_connect/apps/users/models.py`

**Champs collectés à l'inscription :**
- `phone` (Téléphone) ✅
- `email`
- `first_name`, `last_name`
- `date_of_birth` (optionnel)
- `role` (PATIENT, DOCTOR, ADMIN)

**Affichage :** Page "Mon profil" (`Profile.jsx`)
**Modification :** Via `UserProfileSerializer`

---

### 2. **Modèle `PatientData`** (Données statiques du patient)
**Localisation :** `asiko_connect/apps/users/models.py`

**Champs collectés à l'inscription :**
- `age` (Âge) ✅
- `smoking` (booléen - dérivé de `smoking_status`)
- `diabetes` (booléen) ✅
- `copd_asthma` (booléen - dérivé de `asthma`) ✅
- `immunosuppression` (optionnel)

**Note :** Ce modèle est créé automatiquement lors de l'inscription d'un PATIENT.

---

### 3. **Modèle `HealthProfile`** (Profil de santé - Calcul de vulnérabilité)
**Localisation :** `asiko_connect/apps/health_profiles/models.py`

**Champs collectés à l'inscription :**
- `age` (Âge) ✅
- `smoking_status` (Select: NEVER/FORMER/CURRENT) ✅
- `comorbidities` (ManyToMany) :
  - `ASTHMA` (si `asthma` = True) ✅
  - `DIABETES` (si `diabetes` = True) ✅
  - `DEPRESSION` (si `depression` = True) ✅

**Champs modifiables après inscription :**
- `height` (Taille en cm)
- `weight` (Poids en kg)
- `smoking_status` (Statut tabagique)
- `alcohol_consumption` (Consommation d'alcool)
- `comorbidities` (Comorbidités)
- `vaccination_statuses` (Statuts vaccinaux)
- `medical_history` (Historique médical)

**Affichage :** Page "Profil de santé" (`HealthProfile.jsx`)
**Modification :** Via `HealthProfileSerializer`

---

## 🔄 Flux de Données à l'Inscription

```
Frontend (Register.jsx)
    ↓
    Envoie: phone, age, diabetes, asthma, depression, smoking_status
    ↓
Backend (UserRegistrationSerializer)
    ↓
    ┌─────────────────────────────────────┐
    │ Création User                       │
    │ - phone → User.phone                │
    │ - email, first_name, last_name      │
    └─────────────────────────────────────┘
    ↓
    ┌─────────────────────────────────────┐
    │ Création PatientData                │
    │ - age → PatientData.age            │
    │ - smoking_status → PatientData.smoking (booléen)
    │ - diabetes → PatientData.diabetes  │
    │ - asthma → PatientData.copd_asthma│
    └─────────────────────────────────────┘
    ↓
    ┌─────────────────────────────────────┐
    │ Création HealthProfile              │
    │ - age → HealthProfile.age          │
    │ - smoking_status → HealthProfile.smoking_status
    │ - Création Comorbidities:           │
    │   * ASTHMA (si asthma=True)        │
    │   * DIABETES (si diabetes=True)    │
    │   * DEPRESSION (si depression=True)│
    └─────────────────────────────────────┘
    ↓
    Calcul automatique de l'indice de vulnérabilité
```

---

## 🧮 Calcul de l'Indice de Vulnérabilité

**Méthode :** `HealthProfile.calculate_vulnerability_index()`

### Formule de Calcul

Le score total est sur **100 points** (plus élevé = plus vulnérable à la pneumonie).

#### 1. **Score basé sur l'Âge** (0-30 points)
```
≥ 75 ans  → +30 points
≥ 65 ans  → +25 points
≥ 55 ans  → +15 points
≥ 45 ans  → +10 points
≥ 35 ans  → +5 points
< 35 ans  → 0 point
```

#### 2. **Score basé sur les Comorbidités** (0-40 points)
```
Nombre de comorbidités actives × 8 points (max 30 points)
+ 
Nombre de comorbidités sévères × 5 points (max 10 points)
```

**Exemple :**
- 2 comorbidités (Asthme + Diabète) → 2 × 8 = 16 points
- Si 1 est sévère → +5 points
- **Total : 21 points**

#### 3. **Réduction basée sur le Statut Vaccinal** (0-20 points de réduction)
```
Vaccin pneumonie     → -10 points
Vaccin COVID-19      → -5 points
Vaccin grippe (récent) → -5 points
```

**Note :** Le score est réduit, donc un score élevé devient plus faible.

#### 4. **Score basé sur les Facteurs de Risque** (0-10 points)
```
Statut tabagique:
  - Fumeur actuel (CURRENT) → +8 points
  - Ancien fumeur (FORMER)   → +3 points
  - Jamais (NEVER)          → 0 point

Consommation d'alcool:
  - Importante (HEAVY)      → +5 points
  - Régulière (REGULAR)     → +2 points
  - Occasionnelle/Aucune   → 0 point
```

### Exemple de Calcul Complet

**Patient :**
- Âge : 60 ans
- Comorbidités : Diabète (légère) + Asthme (légère)
- Statut tabagique : Fumeur actuel
- Consommation d'alcool : Aucune
- Vaccinations : Aucune

**Calcul :**
```
1. Âge (60 ans)              → +15 points
2. Comorbidités (2 × 8)      → +16 points
3. Vaccinations              → 0 point (pas de réduction)
4. Fumeur actuel            → +8 points
5. Alcool                   → 0 point
─────────────────────────────────────
Total                        = 39 points
```

**Niveau de vulnérabilité :** Modéré (30-49 points)

---

## 📊 Niveaux de Vulnérabilité

```
≥ 70 points  → Très élevé
≥ 50 points  → Élevé
≥ 30 points  → Modéré
≥ 15 points  → Faible
< 15 points  → Très faible
```

---

## ✅ Cohérence Frontend/Backend

### Inscription (Register.jsx)
- ✅ **Checkboxes** pour : Diabète, Asthme, Dépression (cohérent avec HealthProfile)
- ✅ **Select** pour : Statut tabagique (cohérent avec HealthProfile.smoking_status)

### Profil de Santé (HealthProfile.jsx)
- ✅ **Select** pour : Statut tabagique (même format qu'à l'inscription)
- ✅ **Checkboxes** pour : Comorbidités (même format qu'à l'inscription)

**Résultat :** Aucune confusion logique ! 🎯

---

## 🔄 Mise à Jour des Données

### Après l'inscription, l'utilisateur peut modifier :

1. **Profil utilisateur** (`Profile.jsx`) :
   - Téléphone, Email, Nom, Prénom, Date de naissance

2. **Profil de santé** (`HealthProfile.jsx`) :
   - Taille, Poids
   - Statut tabagique (select)
   - Consommation d'alcool (select)
   - Comorbidités (checkboxes)
   - Vaccinations
   - Historique médical

**Note :** Toute modification du profil de santé déclenche automatiquement le recalcul de l'indice de vulnérabilité.

---

## 📝 Résumé des Modifications Appliquées

1. ✅ Frontend : Checkbox "Fumeur" → Select "Statut tabagique"
2. ✅ Backend : `smoking` (booléen) → `smoking_status` (select)
3. ✅ Création automatique de `HealthProfile` à l'inscription
4. ✅ Création automatique des comorbidités (Asthme, Diabète, Dépression)
5. ✅ Calcul automatique de l'indice de vulnérabilité
6. ✅ Cohérence totale entre inscription et profil de santé
