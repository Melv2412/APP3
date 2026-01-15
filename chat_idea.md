## Idée : Chat Médecin ↔ Patient + Partage carnet

- Rôle : le médecin reste un acteur de santé publique, avec une messagerie ciblée par patient.
- Modèles (à créer) : `ChatThread` (patient, doctor, consent partagé), `ChatMessage` (thread, sender, contenu, horodatage).
- Permissions : patient ne voit que ses threads, médecin ne voit que ses threads, pas d’accès global aux autres patients.
- Backend : endpoints REST (pas de WebSocket pour le MVP) : créer thread avec un médecin choisi, lister threads, envoyer/recevoir messages. Toggle/flag pour autoriser le partage du carnet de santé avec ce médecin.
- Partage carnet : API JSON filtrée pour le médecin du thread (ou export ponctuel PDF/JSON) déclenchée depuis le thread.
- Front patient : bouton “Voir médecin” → liste des médecins (role DOCTOR) → ouvre/crée un thread → chat texte + toggle “Partager mon carnet”.
- Front médecin : bouton “Chat” → liste de ses threads → chat texte.
- Portée limitée : messages texte uniquement, polling côté front ; pas de pièces jointes pour le MVP.
- Points de vigilance : consentement explicite pour le partage, journaux d’accès, pas de “médecin voit tout”.
