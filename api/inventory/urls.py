from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    SupplierViewSet,
    ProductViewSet,
    StockMovementViewSet,
    StockAlertViewSet,
    DeliveryOrderViewSet,
    dashboard_overview,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'movements', StockMovementViewSet, basename='movement')
router.register(r'alerts', StockAlertViewSet, basename='alert')
router.register(r'deliveries', DeliveryOrderViewSet, basename='delivery')

urlpatterns = [
    path('dashboard/', dashboard_overview, name='dashboard-overview'),
    path('', include(router.urls)),
]
