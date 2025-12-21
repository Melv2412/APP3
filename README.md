# ASIKO Connect - Backend Django REST Framework

Backend pour le système prédictif ASIKO (Anticiper la Pneumonie).

## 📋 Description

ASIKO est un système intelligent qui combine des données IoT, environnementales et comportementales pour prédire le risque de pneumonie dans une fenêtre de 3 à 7 jours.

## 🚀 Démarrage Rapide

Consultez le fichier [SETUP.md](SETUP.md) pour les instructions d'installation et de configuration.

## 📚 Documentation

- [Plan d'implémentation](dev_backend.md) - Plan complet des phases de développement
- [Guide de configuration](SETUP.md) - Instructions d'installation et configuration

## 🏗️ Architecture

Le projet est organisé en applications Django modulaires :

- `users/` - Gestion des utilisateurs (Patients, Médecins)
- `health_profiles/` - Profils de santé et indices de vulnérabilité
- `sensors/` - Données des capteurs IoT
- `environment/` - Données environnementales
- `predictions/` - Prédictions IA
- `alerts/` - Système d'alertes
- `telemedicine/` - Télémédecine
- `treatments/` - Traitements et prévention
- `dashboard/` - Tableau de bord médecin
- `community/` - Zones à risque communautaires

## 🔧 Technologies

- Django 4.2+
- Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- PostgreSQL (production) / SQLite (développement)
- Python 3.10+

## 📝 Statut du Projet

- ✅ Phase 0 : Configuration de base
- ✅ Phase 1 : Authentification et utilisateurs
- ⏳ Phase 2+ : En cours de développement (voir dev_backend.md)

## 📄 Licence

Projet APP3 2025-2026
