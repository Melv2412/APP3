# project/__init__.py
# Import celery optionnel (pour éviter erreur si celery n'est pas installé)
try:
    from .celery import app as celery_app
    __all__ = ("celery_app",)
except ImportError:
    # Celery n'est pas installé, c'est OK pour le développement sans tâches asynchrones
    __all__ = ()
