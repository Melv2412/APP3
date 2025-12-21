# Guide de Configuration - Backend ASIKO

## Prérequis

- Python 3.10 ou supérieur
- pip (gestionnaire de paquets Python)
- PostgreSQL (pour la production) ou SQLite (pour le développement)

## Installation

### 1. Cloner le projet et créer un environnement virtuel

```bash
# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Windows:
venv\Scripts\activate
# Sur Linux/Mac:
source venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Environnement (development ou production)
ENVIRONMENT=development

# Sécurité
SECRET_KEY=votre-clé-secrète-ici-changez-en-production
DEBUG=True

# Allowed Hosts (séparés par des virgules)
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données (SQLite pour développement)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Microservice IA
AI_MICROSERVICE_URL=http://localhost:8001
AI_MICROSERVICE_TIMEOUT=30
```

### 4. Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Créer un superutilisateur (optionnel)

```bash
python manage.py createsuperuser
```

### 6. Lancer le serveur de développement

```bash
python manage.py runserver
```

Le serveur sera accessible sur `http://localhost:8000`

## Structure des URLs API

### Authentification

- `POST /api/auth/register/` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/token/refresh/` - Rafraîchir le token JWT
- `GET /api/auth/profile/` - Consulter son profil
- `PATCH /api/auth/profile/` - Mettre à jour son profil

### Utilisateurs

- `GET /api/users/` - Liste des utilisateurs (médecins voient tous, patients voient uniquement leur profil)
- `GET /api/users/{id}/` - Détails d'un utilisateur
- `GET /api/users/me/` - Profil de l'utilisateur connecté
- `POST /api/users/change_password/` - Changer son mot de passe

## Exemples de requêtes

### Inscription d'un patient

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patient1",
    "email": "patient1@example.com",
    "password": "MotDePasse123!",
    "password_confirm": "MotDePasse123!",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "PATIENT",
    "phone": "+33612345678",
    "date_of_birth": "1990-01-01"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patient1",
    "password": "MotDePasse123!"
  }'
```

### Accéder à une ressource protégée

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer VOTRE_TOKEN_ACCESS"
```

## Notes importantes

- Les tokens JWT expirent après 1 heure (ACCESS_TOKEN_LIFETIME)
- Utilisez le refresh token pour obtenir un nouveau access token
- En développement, CORS est ouvert à toutes les origines
- En production, configurez `CORS_ALLOWED_ORIGINS` dans le `.env`

## Prochaines étapes

Consultez `dev_backend.md` pour voir le plan d'implémentation complet des autres phases.

