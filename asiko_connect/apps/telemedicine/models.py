from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Thread(models.Model):
    """
    Thread de conversation entre un patient et un médecin.
    """
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_threads',
        verbose_name=_('Patient')
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_threads',
        verbose_name=_('Médecin')
    )
    is_journal_shared = models.BooleanField(
        default=False,
        verbose_name=_('Carnet de santé partagé')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Thread de discussion')
        verbose_name_plural = _('Threads de discussion')
        unique_together = ('patient', 'doctor')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat: {self.patient.username} - {self.doctor.username}"


class Message(models.Model):
    """
    Message individuel au sein d'un thread.
    """
    thread = models.ForeignKey(
        Thread,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('Thread')
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_('Expéditeur')
    )
    content = models.TextField(verbose_name=_('Contenu'))
    is_read = models.BooleanField(default=False, verbose_name=_('Lu'))
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')
        ordering = ['timestamp']

    def __str__(self):
        return f"De {self.sender.username} le {self.timestamp}"
