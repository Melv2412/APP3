# sensor/calculs.py

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
