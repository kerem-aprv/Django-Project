from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from .models import UserProfile
from Chatnivo import settings
#Chatnivo
import os


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=128, min_length=6, write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        user = super().create(validated_data)
        UserProfile.objects.create(user=user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'bio', 'profile_picture']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})  # Extract user data
        user = instance.user

        # Update user data if provided
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.username = user_data.get('username', user.username)
        user.email = user_data.get('email', user.email)
        user.save()

        # Update profile data
        instance.bio = validated_data.get('bio', instance.bio)
        profile_picture = validated_data.get('profile_picture', instance.profile_picture)

        if profile_picture:
            # Delete old profile picture if it exists
            if instance.profile_picture:
                old_profile_picture_path = os.path.join(settings.MEDIA_ROOT, 'profile_pics', instance.profile_picture.name)
                if os.path.exists(old_profile_picture_path):
                    os.remove(old_profile_picture_path)
            instance.profile_picture = profile_picture

        instance.save()
        return instance


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128, write_only=True)

    def validate(self, data):
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if username and email and password:
            user = authenticate(username=username, email=email, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError("User account is disabled.")
            else:
                # Check if the user exists but the password is incorrect
                try:
                    user = User.objects.get(username=username, email=email)
                    raise serializers.ValidationError("Invalid password.")
                except (User.DoesNotExist, User.MultipleObjectsReturned):
                    raise serializers.ValidationError("Invalid username or email.")
        else:
            raise serializers.ValidationError("Must include 'username', 'email', and 'password'.")

        return data
