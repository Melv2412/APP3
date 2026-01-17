# 📡 Guide des Endpoints IOT - ASIKO Connect

Ce document récapitule les points d'entrée (endpoints) API pour connecter vos capteurs matériels (ESP32, Arduino, Raspberry Pi) au backend d'ASIKO Connect.

---

## 1. Capteur Patient (Mobile / Signes Vitaux)

Utilisé par le boîtier porté par le patient pour envoyer ses constantes vitales.

- **URL** : `http://<VOTRE_IP>:8000/api/sensors/measurements/`
- **Méthode** : `POST`
- **Authentification** : Requise (Header `Authorization: Bearer <JWT_TOKEN>`)
- **Format** : `JSON`

### Payload (Corps de la requête)

```json
{
  "user": 1,
  "temperature": 37.5,
  "respiratory_rate": 18,
  "heart_rate": 75,
  "spo2": 98.0,
  "systolic_bp": 120.0,
  "wbc": 7500.0
}
```

| Champ              | Type    | Description                             |
| :----------------- | :------ | :-------------------------------------- |
| `user`             | Integer | ID de l'utilisateur (patient)           |
| `temperature`      | Float   | Température corporelle (°C)             |
| `respiratory_rate` | Float   | Fréquence respiratoire (cycles/min)     |
| `heart_rate`       | Float   | Rythme cardiaque (BPM)                  |
| `spo2`             | Float   | Taux d'oxygène dans le sang (%)         |
| `systolic_bp`      | Float   | Pression artérielle systolique (mmHg)   |
| `wbc`              | Float   | Nombre de globules blancs (Cellules/µL) |

---

## 2. Capteur Environnemental (Zone Fixe / Pollution)

Utilisé par les stations fixes déployées dans les zones pour surveiller la qualité de l'air.

- **URL** : `http://<VOTRE_IP>:8000/api/sensors/data/`
- **Méthode** : `POST`
- **Authentification** : Aucune (Identifié par le `device_id`)
- **Format** : `JSON`

### Payload (Corps de la requête)

```json
{
  "device_id": "Z-YOP-001",
  "pm25": 15.4,
  "pm10": 22.1,
  "o3": 0.04,
  "no2": 0.03,
  "so2": 0.01,
  "co": 0.5,
  "humidity": 60.0,
  "temperature": 28.5,
  "latitude": 5.3484,
  "longitude": -4.0305
}
```

| Champ         | Type   | Description                                          |
| :------------ | :----- | :--------------------------------------------------- |
| `device_id`   | String | Identifiant unique du capteur (doit exister en base) |
| `pm25`        | Float  | Particules fines PM2.5 (µg/m³)                       |
| `pm10`        | Float  | Particules fines PM10 (µg/m³)                        |
| `o3`          | Float  | Ozone (ppm)                                          |
| `no2`         | Float  | Dioxyde d'azote (ppm)                                |
| `so2`         | Float  | Dioxyde de soufre (ppm)                              |
| `co`          | Float  | Monoxyde de carbone (ppm)                            |
| `humidity`    | Float  | Humidité relative (%)                                |
| `temperature` | Float  | Température ambiante (°C)                            |
| `latitude`    | Float  | (Optionnel) Position GPS actuelle                    |
| `longitude`   | Float  | (Optionnel) Position GPS actuelle                    |

---

## 🛠️ Conseils pour le Hardware (ESP32)

1.  **Formatage JSON** : Utilisez la bibliothèque `ArduinoJson` pour construire vos payloads proprement.
2.  **Connexion** : Assurez-vous d'être sur le même réseau que le serveur ou d'utiliser l'IP publique.
3.  **Délai** : Pour les capteurs environnementaux, une mesure toutes les **5 à 15 minutes** est idéale pour ne pas surcharger la base de données.
4.  **Gestion d'Erreur** : Si le code retour est `201 Created`, la donnée est enregistrée. Si c'est `400` ou `500`, vérifiez le format de vos données.

---

_Document généré le 17 Janvier 2026 - ASIKO Connect Team_
