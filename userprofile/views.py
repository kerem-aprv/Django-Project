from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserProfileSerializer
from django.contrib.auth import login, logout, update_session_auth_hash
from django.http import JsonResponse
from .models import UserProfile
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.forms import PasswordChangeForm
from Chatnivo import settings
#Chatnivo
from django.middleware.csrf import get_token
import os


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user_profile = UserProfile.objects.get(user=user)

        if user_profile.profile_picture:
            profile_picture_path = os.path.join(settings.MEDIA_ROOT, 'profile_pics', user_profile.profile_picture.name)
            if os.path.exists(profile_picture_path):
                os.remove(profile_picture_path)

        user_profile.delete()
        user.delete()
        logout(request)
        request.session.flush()
        return Response({'message': 'Account Deleted Successfully'}, status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        form = PasswordChangeForm(user, request.data)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            logout(request)
            request.session.flush()
            return Response({'message': 'Password Changed Successfully'}, status=status.HTTP_200_OK)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            request.session['is_authenticated'] = True
            request.session.flush()
            return Response({
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User Profile Not Found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except UserProfile.DoesNotExist:
            return Response({'error': 'User Profile Not Found'}, status=status.HTTP_404_NOT_FOUND)


class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            request.session['is_authenticated'] = True
            response = Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'csrfToken': get_token(request),
                'sessionId': request.session.session_key
            }, status=status.HTTP_200_OK)
            return response
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            logout(request)
            request.session.flush()
            response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
            self.clear_cookies(response)
            return response
        else:
            return Response({'error': 'User is not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    def clear_cookies(self, response):
        response.delete_cookie('csrftoken')
        response.delete_cookie('sessionid')
        return response


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': request.COOKIES.get('csrftoken')})


def check_login(request):
    is_authenticated = request.session.get('is_authenticated', False)
    if is_authenticated:
        return JsonResponse({'message': 'User is logged in'})
    else:
        return JsonResponse({'message': 'Guest user'})


class UserProfileListCreateView(generics.ListCreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserProfileRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
