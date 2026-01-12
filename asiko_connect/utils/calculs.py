# sensor/calculs.py


from asiko_connect.utils.variables import SEUIL_CRITIQUE


def calculate_trend(values, current_value):
    """
    Calcule la tendance (trend) d'une mesure.
    Si aucune valeur précédente, retourne la valeur actuelle.
    """
    if not values:
        return current_value
    last_values = values[-5:]  # moyenne sur 5 dernières mesures max
    return (sum(last_values) + current_value) / (len(last_values) + 1)


def calculate_curb65(age, confusion=False, bun_high=False, respiratory_rate=0, systolic_bp=0, diastolic_bp=70):
    """
    Calcule le score CURB-65 dynamiquement.
    """
    score = 0
    score += 1 if confusion else 0
    score += 1 if bun_high else 0
    score += 1 if respiratory_rate >= 30 else 0
    score += 1 if systolic_bp < 90 or diastolic_bp <= 60 else 0
    score += 1 if age >= 65 else 0
    return score

def risk_level(prob):
    if prob < 0.3:
        return "Faible"
    elif prob < 0.6:
        return "Modéré"
    else:
        return "Élevé"


def calculate_air_quality_index(
    pm25, pm10, o3, no2, so2, co, humidity, temperature
):
    """
    Calcule l'IQA en intégrant :
    - Polluants (base)
    - Température et humidité (facteurs aggravants)

    Retour :
    - iqa : 0 - 500
    - category : catégorie AQI
    - advice : conseil santé
    - trigger_alert : True si iqa >= 100
    """

    # 🔹 Pondérations des polluants (85 %)
    weights = {
        "pm25": 0.30,
        "pm10": 0.20,
        "o3": 0.15,
        "no2": 0.10,
        "so2": 0.07,
        "co": 0.03
    }

    base_iqa = (
        pm25 * weights["pm25"] +
        pm10 * weights["pm10"] +
        o3 * weights["o3"] +
        no2 * weights["no2"] +
        so2 * weights["so2"] +
        co * weights["co"]
    )

    # 🔹 Facteur température
    temp_factor = 1.0
    if temperature > 32:
        temp_factor += 0.10
    elif 26 < temperature <= 32:
        temp_factor += 0.05
    elif temperature < 18:
        temp_factor += 0.03

    # 🔹 Facteur humidité
    humidity_factor = 1.0
    if humidity > 75:
        humidity_factor += 0.10
    elif 60 < humidity <= 75:
        humidity_factor += 0.05
    elif humidity < 30:
        humidity_factor += 0.03

    # 🔹 Application des facteurs climatiques (15 % max)
    climate_factor = (temp_factor + humidity_factor) / 2
    iqa = base_iqa * climate_factor

    # 🔒 Limites
    iqa = min(max(iqa, 0), 500)

    # 🔹 Catégories
    if iqa <= 50:
        category = "Bien"
        advice = "Qualité de l'air satisfaisante."
    elif iqa <= 100:
        category = "Modéré"
        advice = "Acceptable, personnes sensibles vigilantes."
    elif iqa <= 150:
        category = "Malsain pour groupes sensibles"
        advice = "Limiter les efforts prolongés."
    elif iqa <= 200:
        category = "Mauvais"
        advice = "Éviter les activités extérieures prolongées."
    elif iqa <= 300:
        category = "Très malsain"
        advice = "Conditions dangereuses pour la santé."
    else:
        category = "Dangereux"
        advice = "Alerte sanitaire grave."

    return {
        "iqa": round(iqa, 2),
        "category": category,
        "advice": advice,
        "trigger_alert": iqa >= SEUIL_CRITIQUE
    }
