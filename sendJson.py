import requests
import time

# URL de l'API
URL = "http://127.0.0.1:8000/api/sensors/data/"
LOGIN_URL = "http://127.0.0.1:8000/api/auth/login/"  # endpoint de login

# Identifiants
USERNAME = "lama"
PASSWORD = "L@djilama123"

# Données fixes
DEVICE_ID = "ESP32_TEST_001"
LATITUDE = 5.348
LONGITUDE = -4.003

payload = {
    "device_id": DEVICE_ID,
    "pm25": 180.0,
    "pm10": 350.0,
    "o3": 120.0,
    "no2": 90.0,
    "so2": 45.0,
    "co": 250.0,
    "humidity": 80.0,
    "temperature": 35.0,
    "latitude": LATITUDE,
    "longitude": LONGITUDE
}


def get_token(username="l.kamfox7@gmail.com", password="L@djilama123"):
    """Récupère un token JWT via le endpoint de login"""
    try:
        response = requests.post(
            LOGIN_URL,
            json={"username": username, "password": password}
        )
        response.raise_for_status()
        token = response.json().get("tokens", {}).get("access")  # vérifie que ton endpoint renvoie 'token'
        if not token:
            raise ValueError("Aucun token retourné par le serveur")
        print("Token récupéré avec succès")
        return token
    except Exception as e:
        print(f"Impossible de récupérer le token : {e}")
        return None


def send_data(interval_seconds=1, repetitions=100):
    """Envoie les données à l'API en gérant le token"""
    token = get_token()  # on commence par récupérer le token
    if not token:
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    for i in range(repetitions):
        try:
            response = requests.post(URL, json=payload, headers=headers)

            try:
                data = response.json()
            except:
                data = response.text

            print(f"[{i+1}/{repetitions}] {response.status_code} --> {data}")

            # Gestion des erreurs serveur
            if response.status_code == 404:
                print("Capteur non trouvé : vérifie device_id dans la base")
                break

            if response.status_code == 401:
                print("Token invalide ou expiré, récupération d'un nouveau token...")
                token = get_token()
                if not token:
                    print("Impossible de récupérer un nouveau token, arrêt.")
                    break
                headers["Authorization"] = f"Bearer {token}"
                continue  # réessayer immédiatement avec le nouveau token

        except Exception as e:
            print(f"Erreur réseau : {e}")

        time.sleep(interval_seconds)


if __name__ == "__main__":
    send_data()
