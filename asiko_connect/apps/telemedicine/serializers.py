from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Thread, Message

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'thread', 'sender', 'sender_name', 'content', 'is_read', 'timestamp', 'is_me']
        read_only_fields = ['sender', 'is_read', 'timestamp']

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False

class ThreadSerializer(serializers.ModelSerializer):
    patient_details = UserSimpleSerializer(source='patient', read_only=True)
    doctor_details = UserSimpleSerializer(source='doctor', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            'id', 'patient', 'doctor', 'patient_details', 'doctor_details', 
            'is_journal_shared', 'created_at', 'updated_at', 
            'last_message', 'unread_count'
        ]
        read_only_fields = ['patient', 'doctor', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg, context=self.context).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

class ThreadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ['doctor']

    def validate_doctor(self, value):
        if value.role != User.Role.DOCTOR:
            raise serializers.ValidationError("L'utilisateur sélectionné n'est pas un médecin.")
        return value
