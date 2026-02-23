"""
Serializers pour la gestion des utilisateurs.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User,PatientData


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les informations utilisateur."""
    
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'role_display',
            'phone',
            'date_of_birth',
            'is_verified',
            'date_joined',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    # Champs spécifiques aux patients
    age = serializers.IntegerField(required=False, allow_null=True, min_value=0, max_value=150)
    smoking_status = serializers.ChoiceField(
        choices=[
            ('NEVER', 'Jamais'),
            ('FORMER', 'Ancien fumeur'),
            ('CURRENT', 'Fumeur actuel'),
        ],
        required=False,
        default='NEVER'
    )
    vaccination_status = serializers.ChoiceField(
        choices=[
            ('OK', 'OK'),
            ('EN_RETARD', 'EN RETARD'),
        ],
        required=False,
        default='OK'
    )
    diabetes = serializers.BooleanField(required=False, default=False)
    asthma = serializers.BooleanField(required=False, default=False)
    depression = serializers.BooleanField(required=False, default=False)
    copd_asthma = serializers.BooleanField(required=False, default=False)  # Gardé pour compatibilité
    immunosuppression = serializers.BooleanField(required=False, default=False)
    emergency_contact_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    emergency_contact_phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    emergency_contact_relation = serializers.ChoiceField(
        choices=PatientData.EmergencyRelation.choices, write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role', 'phone',
            'date_of_birth', 'age', 'smoking_status', 'vaccination_status', 'diabetes', 'asthma', 'depression', 'copd_asthma', 'immunosuppression',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'
        ]

        extra_kwargs = {
                'email': {'required': True},
                'first_name': {'required': True},
                'last_name': {'required': True},
            }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        # Les champs emergency_contact sont optionnels (blank=True, null=True dans le modèle)
        # Pas besoin de validation stricte ici
        return attrs

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError('Vous ne pouvez pas créer un compte administrateur.')
        return value

    def create(self, validated_data):
        from django.db import transaction
        from datetime import date
        from asiko_connect.apps.health_profiles.models import HealthProfile, Comorbidity, VaccinationStatus
        
        # Récupérer et supprimer le password
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        # Extraire les champs pour HealthProfile (avant PatientData pour éviter les conflits)
        age = validated_data.pop('age', None)
        asthma = validated_data.pop('asthma', False)
        depression = validated_data.pop('depression', False)
        diabetes_health = validated_data.pop('diabetes', False)
        smoking_status = validated_data.pop('smoking_status', 'NEVER')  # Select au lieu de booléen
        vaccination_status = validated_data.pop('vaccination_status', 'OK')  # Nouveau : statut vaccinal
        copd_asthma = validated_data.pop('copd_asthma', False)
        
        # Extraire les champs patient pour PatientData
        patient_fields = {field: validated_data.pop(field, None) for field in [
            'immunosuppression',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'
        ]}
        
        # Ajouter les champs médicaux à PatientData (utiliser les valeurs extraites)
        # Convertir smoking_status en booléen pour PatientData (smoking)
        patient_fields['smoking'] = (smoking_status == 'CURRENT')
        patient_fields['diabetes'] = diabetes_health
        patient_fields['copd_asthma'] = copd_asthma or asthma  # Si asthma est True, mettre copd_asthma aussi

        # Utiliser une transaction pour s'assurer que tout est créé ou rien
        with transaction.atomic():
            # Créer l'utilisateur
            user = User.objects.create_user(password=password, **validated_data)

            # Créer PatientData et HealthProfile si rôle PATIENT
            if user.role == User.Role.PATIENT:
                # Calculer l'âge si non fourni mais date_of_birth disponible
                calculated_age = age
                if not calculated_age and user.date_of_birth:
                    today = date.today()
                    calculated_age = today.year - user.date_of_birth.year - (
                        (today.month, today.day) < (user.date_of_birth.month, user.date_of_birth.day)
                    )

                # Créer PatientData (qui créera automatiquement un HealthProfile de base via save())
                patient_data = PatientData.objects.create(
                    user=user,
                    age=calculated_age if calculated_age else 0,
                    **patient_fields
                )
                
                # Récupérer le HealthProfile créé par PatientData.save()
                health_profile = user.health_profile
                
                # Mettre à jour le HealthProfile avec les détails supplémentaires
                health_profile.age = calculated_age
                health_profile.smoking_status = smoking_status
                health_profile.save()
                
                # Créer et associer les comorbidités
                comorbidities_to_add = []
                
                if asthma or copd_asthma:
                    comorbidity, created = Comorbidity.objects.get_or_create(
                        name='ASTHMA',
                        defaults={'severity': 'MILD', 'is_active': True}
                    )
                    comorbidities_to_add.append(comorbidity)
                
                if diabetes_health:
                    comorbidity, created = Comorbidity.objects.get_or_create(
                        name='DIABETES',
                        defaults={'severity': 'MILD', 'is_active': True}
                    )
                    comorbidities_to_add.append(comorbidity)
                
                if depression:
                    comorbidity, created = Comorbidity.objects.get_or_create(
                        name='DEPRESSION',
                        defaults={'severity': 'MILD', 'is_active': True}
                    )
                    comorbidities_to_add.append(comorbidity)
                
                if comorbidities_to_add:
                    health_profile.comorbidities.set(comorbidities_to_add)
                
                # Créer et associer le statut vaccinal pour la PNEUMONIE uniquement
                vaccination_status_obj = VaccinationStatus.objects.create(
                    vaccine_type='PNEUMONIA',
                    status=vaccination_status,
                    is_vaccinated=(vaccination_status == 'OK'),
                )
                health_profile.vaccination_statuses.add(vaccination_status_obj)
                
                # Calculer l'indice de vulnérabilité
                health_profile.calculate_vulnerability_index()
                
                # Forcer la sauvegarde pour s'assurer que tout est bien enregistré
                health_profile.save()
            
            return user
    


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion."""
    
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil utilisateur (mise à jour)."""
    
    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'phone',
            'date_of_birth',
        ]
    
    def validate_email(self, value):
        """Vérifie que l'email n'est pas déjà utilisé."""
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                'Cet email est déjà utilisé par un autre compte.'
            )
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe."""
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Valide que les nouveaux mots de passe correspondent."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password': 'Les nouveaux mots de passe ne correspondent pas.'
            })
        return attrs
    
    def validate_old_password(self, value):
        """Vérifie que l'ancien mot de passe est correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('L\'ancien mot de passe est incorrect.')
        return value



  # Si ton UserSerializer est séparé

class PatientDataSerializer(serializers.ModelSerializer):
    """Serializer pour les données médicales d'un patient."""

    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='PATIENT'),
        source='user',
        write_only=True
    )

    class Meta:
        model = PatientData
        fields = [
            'id', 'user', 'user_id', 'age',
            'smoking', 'diabetes', 'copd_asthma', 'immunosuppression',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
