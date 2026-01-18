from queue import Queue

# Queue globale pour broadcast
broadcast_queue = Queue()

def get_broadcast_queue():
    return broadcast_queue
