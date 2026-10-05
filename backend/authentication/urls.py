from django.urls import path
from .views import LoginView, LogoutView, ProfileView, RegisterView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('register/', RegisterView.as_view(), name='auth-register'),
]
