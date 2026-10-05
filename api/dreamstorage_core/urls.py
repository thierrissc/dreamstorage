"""
URL configuration for dreamstorage_core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'name': 'DreamStorage Inventory API',
        'version': '1.0.0',
        'status': 'healthy',
        'description': 'API RESTful para controle de estoque de alta performance',
        'endpoints': {
            'dashboard': '/api/inventory/dashboard/',
            'products': '/api/inventory/products/',
            'categories': '/api/inventory/categories/',
            'suppliers': '/api/inventory/suppliers/',
            'movements': '/api/inventory/movements/',
            'alerts': '/api/inventory/alerts/',
            'auth_login': '/api/auth/login/',
            'auth_profile': '/api/auth/profile/',
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/inventory/', include('inventory.urls')),
    path('api/auth/', include('authentication.urls')),
]

