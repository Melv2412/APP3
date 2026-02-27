# send_sensor_data_x_times.py
import time
import requests


API_BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{API_BASE_URL}/auth/login/"
SENSOR_DATA_URL = f"{API_BASE_URL}/sensors/data/"


def get_access_token(username: str, password: str) -> str:
    r = requests.post(
        LOGIN_URL,
        json={"username": username, "password": password},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()["tokens"]["access"]


def send_sensor_data_x_times(x: int, device_id: str, use_auth=False, username="l@gmail.com", password="12345678", delay=1.0):
    headers = {"Content-Type": "application/json"}

    if use_auth:
        token = get_access_token(username, password)
        headers["Authorization"] = f"Bearer {token}"

    payload = {
        "device_id": device_id,
        "latitude": 5.34,      # optionnel
        "longitude": -4.05,    # optionnel
        "pm25": 200.0,
        "pm10": 150.0,
        "o3": 35.0,
        "no2": 45.0,
        "so2": 20.0,
        "co": 12.0,
        "humidity": 70.0,
        "temperature": 30.0
    }

    success = 0
    for i in range(1, x + 1):
        r = requests.post(SENSOR_DATA_URL, json=payload, headers=headers, timeout=10)
        if r.status_code in (200, 201):
            success += 1
            print(f"[{i}/{x}] OK -> {r.status_code}")
        else:
            print(f"[{i}/{x}] ERROR -> {r.status_code} | {r.text}")

        if i < x:
            time.sleep(delay)

    print(f"\nTerminé: {success}/{x} envois réussis.")


if __name__ == "__main__":
    # Exemple sans auth
   

    # Exemple avec auth (si nécessaire)
    send_sensor_data_x_times(
        x=10,
        device_id="ESP_TEST_001",
        use_auth=True,
        username="l.kamfox7@gmail.com",
        password="L@djilama123",
        delay=0.5
    )
