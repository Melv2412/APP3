import requests

ESP32_IP = "192.168.137.197"  # Remplacer par l'IP de ton ESP32
try:
    response = requests.get(f"http://{ESP32_IP}/buzzer")
    if response.status_code == 200:
        print("Buzzer activé !")
    else:
        print("Erreur lors de l'activation du buzzer")
except Exception as e:
    print("Impossible de contacter l'ESP32:", e)

