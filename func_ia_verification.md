## Fonction de vérification IA de l’authenticité des documents

Ce fichier décrit **comment implémenter** (plus tard) une vérification d’authenticité de documents via un service d’IA, **sans que cela ne bloque actuellement l’upload**.  
Actuellement, **aucune vérification d’authenticité de documents n’est implémentée dans le code**, donc tous les futurs endpoints d’upload que tu créeras pourront enregistrer directement en base de données tant que tu ne branches pas cette logique.

---

### 1. Objectif fonctionnel

- **But**: lorsqu’un utilisateur upload un document (PDF, image, etc.), appeler un microservice IA qui renvoie:
  - un **score d’authenticité** (ex: `0.0`–`1.0`),
  - éventuellement des **explications** (raison du rejet, caractéristiques suspectes, etc.).
- **Comportement souhaité à terme**:
  - Si la vérification est **OK**: enregistrer le document en base de données (et éventuellement stocker le score).
  - Si la vérification est **KO**: refuser l’upload ou marquer le document comme “à vérifier manuellement”.

Pour le moment, tu souhaites **désactiver / ne pas implémenter** cette étape, donc les uploads futurs iront **directement en base** (la logique de vérification sera ajoutée plus tard, si tu le décides).

---

### 2. Architecture recommandée

Sur le modèle de `asiko_connect/utils/ai_client.py` (qui appelle déjà un microservice IA pour la prédiction de pneumonie), tu peux créer un client IA dédié aux documents.

#### 2.1. Nouveau client IA pour les documents

Fichier recommandé: `asiko_connect/utils/ai_document_client.py`

Fonction suggérée:

```python
def verify_document_with_ai(document_file, metadata=None):
    """
    Appelle le microservice IA pour vérifier l'authenticité d'un document.

    Args:
        document_file: fichier (File) envoyé par l'utilisateur
        metadata: dict optionnel (type de document, user_id, etc.)

    Returns:
        dict, par ex.:
        {
            "authenticity_score": 0.92,
            "is_authentic": True,  # ou False selon un seuil
            "details": {...}      # raisons, features détectées, etc.
        }

    Raises:
        AIMicroserviceError: en cas de problème réseau / HTTP
        DocumentVerificationError: si la réponse IA est invalide
    """
```

Ce client fonctionnerait exactement comme `call_ai_microservice`:

- Récupération de l’URL du microservice dans `settings` (ex: `AI_DOCUMENT_VERIFICATION_URL`).
- `requests.post` avec:
  - `files={'document': document_file}`  
  - `data=metadata` (optionnel)
- Gestion des erreurs (timeout, HTTPError, etc.).

---

### 3. Intégration côté Django (vues / serializers / models)

#### 3.1. Modèle de document

Dans une app adaptée (par ex. `telemedicine`, `treatments` ou une nouvelle app `documents`), tu peux créer un modèle:

```python
class UserDocument(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to="documents/")
    created_at = models.DateTimeField(auto_now_add=True)

    # Champs liés à la vérification IA
    authenticity_score = models.FloatField(null=True, blank=True)
    is_authentic = models.BooleanField(null=True, blank=True)
    verification_details = models.JSONField(null=True, blank=True)
```

Pour l’instant, **si tu ne branches pas le client IA**, tu peux simplement:

- créer et sauvegarder l’instance `UserDocument` avec seulement `file` et les infos de base,
- laisser `authenticity_score`, `is_authentic` et `verification_details` à `null`.

#### 3.2. Vue d’upload sans vérification (comportement actuel souhaité)

Exemple de vue DRF (simplifiée) qui **n’appelle pas encore l’IA**:

```python
class UserDocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"detail": "Aucun fichier fourni."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doc = UserDocument.objects.create(
            user=request.user,
            file=uploaded_file,
            # Pas de vérification IA pour l’instant
            authenticity_score=None,
            is_authentic=None,
            verification_details=None,
        )

        return Response(
            {"id": doc.id, "file": doc.file.url},
            status=status.HTTP_201_CREATED,
        )
```

Avec cette implémentation, **les documents sont uploadés et sauvegardés directement en base** (et sur le storage configuré), **sans aucune vérification d’authenticité**.

---

### 4. Comment activer la vérification IA plus tard

Quand tu voudras **activer** la vérification IA, il suffira de:

1. **Créer le microservice IA de vérification documentaire** (FastAPI, etc.) qui:
   - reçoit un fichier `document`,
   - renvoie un JSON avec le score et le verdict.
2. **Implémenter `verify_document_with_ai`** dans `ai_document_client.py` en suivant le pattern de `ai_client.py`.
3. **Modifier la vue d’upload** pour:
   - appeler `verify_document_with_ai(uploaded_file, metadata=...)`,
   - décider, selon la réponse:
     - soit d’enregistrer quand même (en stockant le score),
     - soit de refuser la création du document (`HTTP_400_BAD_REQUEST` ou `HTTP_403_FORBIDDEN`).

Tant que tu ne fais **pas** cette étape 3 dans ton code, les documents continueront d’être enregistrés **directement** sans contrôle d’authenticité.

---

### 5. Résumé

- **Actuellement**:  
  - Dans ce dépôt, il **n’existe aucune fonction** de vérification d’authenticité de document.  
  - Donc les endpoints d’upload que tu créeras sauvegarderont les fichiers **directement en base / storage**, tant que tu ne rajoutes pas la logique IA.
- **Ce fichier** te sert de guide pour:
  - savoir **où** et **comment** ajouter plus tard une fonction `verify_document_with_ai`,
  - l’intégrer proprement dans un endpoint d’upload Django/DRF,
  - contrôler le comportement (bloquant ou non) selon le score renvoyé par l’IA.




