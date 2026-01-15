"""
Serializers pour la gestion des profils de santé.
"""
from rest_framework import serializers
from .models import HealthProfile, Comorbidity, VaccinationStatus


class ComorbiditySerializer(serializers.ModelSerializer):
    """Serializer pour les comorbidités."""
    
    name_display = serializers.CharField(source='get_name_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = Comorbidity
        fields = [
            'id',
            'name',
            'name_display',
            'description',
            'severity',
            'severity_display',
            'diagnosed_date',
            'is_active',
        ]
        read_only_fields = ['id']


class VaccinationStatusSerializer(serializers.ModelSerializer):
    """Serializer pour le statut vaccinal."""
    
    vaccine_type_display = serializers.CharField(source='get_vaccine_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = VaccinationStatus
        fields = [
            'id',
            'vaccine_type',
            'vaccine_type_display',
            'status',
            'status_display',
            'is_vaccinated',
            'vaccination_date',
            'booster_date',
            'notes',
        ]
        read_only_fields = ['id']


class HealthProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil de santé."""
    
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    comorbidities = ComorbiditySerializer(many=True, read_only=True)
    vaccination_statuses = VaccinationStatusSerializer(many=True, read_only=True)
    vulnerability_level = serializers.CharField(source='get_vulnerability_level', read_only=True)
    bmi = serializers.FloatField(read_only=True)
    
    # Champs pour la création/mise à jour
    comorbidity_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Comorbidity.objects.all(),
        source='comorbidities',
        required=False,
        write_only=True
    )
    
    vaccination_status_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=VaccinationStatus.objects.all(),
        source='vaccination_statuses',
        required=False,
        write_only=True
    )
    
    class Meta:
        model = HealthProfile
        fields = [
            'id',
            'user',
            'user_id',
            'age',
            'height',
            'weight',
            'bmi',
            'comorbidities',
            'comorbidity_ids',
            'vaccination_statuses',
            'vaccination_status_ids',
            'medical_history',
            'smoking_status',
            'alcohol_consumption',
            'vulnerability_index',
            'vulnerability_level',
            'vulnerability_index_last_calculated',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'vulnerability_index',
            'vulnerability_index_last_calculated',
            'created_at',
            'updated_at',
        ]
    
    def validate_age(self, value):
        """Valide que l'âge est dans une plage raisonnable."""
        if value and (value < 0 or value > 150):
            raise serializers.ValidationError("L'âge doit être entre 0 et 150 ans.")
        return value
    
    def validate_height(self, value):
        """Valide que la taille est dans une plage raisonnable."""
        if value and (value < 50 or value > 250):
            raise serializers.ValidationError("La taille doit être entre 50 et 250 cm.")
        return value
    
    def validate_weight(self, value):
        """Valide que le poids est dans une plage raisonnable."""
        if value and (value < 1 or value > 500):
            raise serializers.ValidationError("Le poids doit être entre 1 et 500 kg.")
        return value
    
    def create(self, validated_data):
        """Crée un nouveau profil de santé."""
        # Extraire les données ManyToMany
        comorbidities = validated_data.pop('comorbidities', [])
        vaccination_statuses = validated_data.pop('vaccination_statuses', [])
        
        # Créer le profil
        profile = HealthProfile.objects.create(**validated_data)
        
        # Ajouter les relations ManyToMany
        if comorbidities:
            profile.comorbidities.set(comorbidities)
        if vaccination_statuses:
            profile.vaccination_statuses.set(vaccination_statuses)
        
        # Calculer l'indice de vulnérabilité
        profile.calculate_vulnerability_index()
        
        return profile
    
    def update(self, instance, validated_data):
        """Met à jour un profil de santé existant."""
        # Extraire les données ManyToMany
        comorbidities = validated_data.pop('comorbidities', None)
        vaccination_statuses = validated_data.pop('vaccination_statuses', None)
        
        # Mettre à jour les champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les relations ManyToMany si fournies
        if comorbidities is not None:
            instance.comorbidities.set(comorbidities)
        if vaccination_statuses is not None:
            instance.vaccination_statuses.set(vaccination_statuses)
        
        # Recalculer l'indice de vulnérabilité
        instance.calculate_vulnerability_index()
        
        return instance


class VulnerabilityIndexSerializer(serializers.Serializer):
    """Serializer pour la réponse du calcul de l'indice de vulnérabilité."""
    
    vulnerability_index = serializers.FloatField()
    vulnerability_level = serializers.CharField()
    last_calculated = serializers.DateTimeField()
    factors = serializers.DictField()

