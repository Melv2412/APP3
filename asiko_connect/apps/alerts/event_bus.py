from queue import Queue
from threading import Lock

USER_CHANNELS = {}
LOCK = Lock()

def get_user_queue(user_id):
    with LOCK:
        if user_id not in USER_CHANNELS:
            USER_CHANNELS[user_id] = Queue()
        return USER_CHANNELS[user_id]
