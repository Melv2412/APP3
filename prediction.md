# ASIKO Connect – Prediction Pipeline

## 1. Contexte général

ASIKO Connect est une application backend orientée santé dont l’objectif est d’évaluer **le risque et la probabilité qu’un patient développe une pneumonie dans les 72 heures**, en se basant sur :

* des **données statiques patient** (profil médical),
* des **données dynamiques issues de capteurs**,
* des **indicateurs cliniques calculés côté backend**,
* un **modèle de machine learning XGBoost** pré-entraîné.

La prédiction ne remplace pas un diagnostic médical, mais fournit **un indicateur de risque chiffré et interprétable**, exploitable pour le suivi et l’alerte.

## 2. Architecture globale de la prédiction

Le pipeline de prédiction est déclenché **lorsqu’une nouvelle mesure capteur (`SensorMeasurement`) est envoyée via l’API**.

Flux simplifié :

1. Réception des données capteurs via l’API REST
2. Enregistrement de la mesure
3. Calcul des indicateurs dérivés (delta, tendances, score clinique)
4. Construction du vecteur de features
5. Appel du modèle ML XGBoost
6. Stockage de la prédiction
7. Retour API (mesure + résultats ML)


## 3. Source des données

### 3.1 Données statiques (PatientData)

Ces données sont liées à l’utilisateur (rôle `PATIENT`) et représentent son profil médical de base :

* âge (calculé à partir de la date de naissance)

(s'il fume ...)

* smoking
* diabetes
* copd_asthma
* immunosuppression

Ces données sont persistantes et réutilisées pour chaque prédiction.



### 3.2 Données dynamiques (SensorMeasurement)

Chaque appel API crée une nouvelle occurrence de `SensorMeasurement`.
Un même patient peut donc avoir **plusieurs mesures successives**.



<!-- ` class SensorMeasurement(models.Model):
    """
    Mesures envoyées par les capteurs pour un patient.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sensor_measurements",
        verbose_name=_("Patient")
    )

    # Signes vitaux mesurés
    temperature = models.FloatField()
    respiratory_rate = models.FloatField()
    heart_rate = models.FloatField()
    spo2 = models.FloatField()
    systolic_bp = models.FloatField()
    wbc = models.FloatField()

    # Champs calculés
    curb65 = models.IntegerField(default=0)
    delta_respiratory_rate = models.FloatField(default=0.0)
    delta_spo2 = models.FloatField(default=0.0)
    delta_wbc = models.FloatField(default=0.0)
    rr_trend = models.FloatField(default=0.0)
    spo2_trend = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Mesure capteur")
        verbose_name_plural = _("Mesures capteurs")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Mesure de {self.user.username} à {self.created_at}" -->




## 4. Calculs backend

Avant l’appel au modèle ML, plusieurs calculs sont effectués côté backend (dans `utils.calculs`) afin d’enrichir les données brutes.

### 4.1 Deltas

Comparaison avec les dernières mesures disponibles du même patient :

* delta_respiratory_rate
* delta_spo2
* delta_wbc
* confusion ...

Ces valeurs permettent de capturer l’évolution récente de l’état du patient.

### 4.2 Tendances

Les tendances sont calculées à partir d’un historique court de mesures :

* rr_trend (respiratory rate)
* spo2_trend

Elles permettent d’indiquer si l’état du patient s’améliore ou se dégrade.


### 4.3 Score clinique CURB-65

Le score CURB-65 est calculé dynamiquement à partir :

* de l’âge du patient
* de la fréquence respiratoire
* de la pression artérielle systolique

Ce score est intégré comme **feature d’entrée du modèle ML**.


## 5. Modèle de Machine Learning

### 5.1 Type de modèle

* Algorithme : **XGBoost**
* Type : **classification binaire**
* Objectif : estimer la **probabilité de pneumonie à 72h**


### 5.2 Chargement du modèle

Le modèle est chargé depuis :

```
asiko_connect.apps.sensors.ml_model
```

Le chargement est effectué de manière centralisée afin d’éviter un rechargement inutile à chaque requête.


### 5.3 Features utilisées

Le modèle reçoit un vecteur structuré comprenant :

* données statiques patient
* données capteurs courantes
* score CURB-65
* deltas
* tendances

L’ordre et la structure des features correspondent exactement à ceux utilisés lors de l’entraînement du modèle.


## 6. Sorties du modèle

Le modèle retourne **deux informations complémentaires** :

* `probabilite_pneumonie_72h`
  → valeur numérique entre 0 et 1 (convertie en pourcentage côté API)

* `niveau_risque`
  → catégorisation du risque (Faible / Modéré / Élevé) dérivée de la probabilité

Ces deux valeurs sont retournées dans la réponse API.


## 7. Stockage des prédictions

Chaque prédiction est persistée dans la base de données via le modèle `Prediction`, avec les champs :

* `user` : patient concerné
* `input_data` : features utilisées pour la prédiction
* `result` : sortie du modèle
* `created_at` : date de génération

Cela permet :

* un historique complet,
* des analyses ultérieures,
* une traçabilité des décisions.


## 8. API et performances

* Les données capteurs sont transmises via **API REST**
* La prédiction est effectuée **synchroniquement** après l’enregistrement de la mesure
* Les optimisations récentes ont permis de :

  * réduire le temps d’inférence,
  * éviter les recalculs inutiles,
  * garantir une réponse rapide de l’API.



## 9. Objectif fonctionnel

L’objectif principal de ce pipeline est de :

> Fournir **une estimation quantitative et qualitative du risque de pneumonie**, basée sur l’état actuel et l’évolution récente du patient, afin d’aider au suivi et à l’anticipation des complications.


