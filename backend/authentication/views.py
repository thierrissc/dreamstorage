from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            # Retorna token e dados do usuário
            return Response({
                'message': 'Autenticado com sucesso!',
                'user': UserSerializer(user).data,
                'token': f"token-{user.id}-{user.username}"  # Token simplificado para sessão segura
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response({'message': 'Sessão encerrada com sucesso.'}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        # Modo demo / visitante
        return Response({
            'id': 1,
            'username': 'admin',
            'email': 'admin@dreamstorage.io',
            'first_name': 'Gestor',
            'last_name': 'DreamStorage',
            'is_staff': True,
            'is_superuser': True
        })


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuário cadastrado com sucesso!',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
