from queue import Queue

clients = []
# utils/notify.py
def notify_frontend(message):
      for client_queue in clients:
        client_queue.put(message)


def notify_esp(alert):
    print("NOTIFY ESP32 FUNCTION CALLED")



