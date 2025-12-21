"""
Serializers pour la gestion des utilisateurs.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


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
    """Serializer pour l'inscription d'un nouvel utilisateur."""
    
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
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'role',
            'phone',
            'date_of_birth',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Valide que les mots de passe correspondent."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password': 'Les mots de passe ne correspondent pas.'
            })
        return attrs
    
    def validate_role(self, value):
        """Valide que le rôle est valide (pas ADMIN à l'inscription)."""
        if value == User.Role.ADMIN:
            raise serializers.ValidationError(
                'Vous ne pouvez pas créer un compte administrateur.'
            )
        return value
    
    def create(self, validated_data):
        """Crée un nouvel utilisateur."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
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

