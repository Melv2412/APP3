# Scripts de Démo ASIKO

## Script de création de zone à risque

### `create_risk_zone_demo.py`

Script pour simuler l'envoi de données depuis un capteur IoT et créer une zone à risque.

### Prérequis

1. **Créer une Zone dans l'admin Django** :
   - Aller sur `http://localhost:8000/admin/`
   - Créer une Zone avec un nom (ex: "Salle de Présentation")

2. **Créer un Sensor dans l'admin Django** :
   - Créer un Sensor avec :
     - `device_id`: `DEMO_SENSOR_001`
     - `zone`: La zone créée précédemment

3. **Installer les dépendances** :
   ```bash
   pip install requests
   ```

### Usage

#### Avec coordonnées par défaut (Abidjan)
```bash
python scripts/create_risk_zone_demo.py
```

#### Avec coordonnées personnalisées
```bash
python scripts/create_risk_zone_demo.py <latitude> <longitude>
```

Exemple:
```bash
python scripts/create_risk_zone_demo.py 5.316667 -4.033333
```

### Ce que fait le script

1. Envoie des données de pollution élevées au backend
2. Met à jour automatiquement la position GPS de la Zone
3. Déclenche une alerte si les seuils sont dépassés
4. Crée des actions préventives associées

### Données envoyées

- **PM2.5**: 150 (très élevé, seuil critique ~50)
- **PM10**: 200 (très élevé)
- **O3, NO2, SO2, CO**: Valeurs élevées
- **Position GPS**: Mise à jour automatique de la Zone

### Vérification

Après exécution, vérifiez :
1. Dans l'admin Django : La Zone a été mise à jour avec les coordonnées GPS
2. Dans l'admin Django : Une Alerte a été créée (si seuils dépassés)
3. Dans l'app frontend : La zone apparaît sur la carte avec la position correcte
