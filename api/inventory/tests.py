from decimal import Decimal
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from .models import Category, Product, StockMovement


class InventorySecurityAndIntegrityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='admin_estoque',
            email='admin@dreamstorage.local',
            password='SenhaSegura123!'
        )
        self.category = Category.objects.create(
            name='Eletronicos',
            description='Dispositivos e acessorios',
            color='#3062ea'
        )
        self.product = Product.objects.create(
            name='Scanner Portatil',
            sku='SCN-001',
            category=self.category,
            cost_price=Decimal('150.00'),
            selling_price=Decimal('280.00'),
            quantity=10,
            min_stock=5,
            unit_measure='UN'
        )

    def test_list_products_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/inventory/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_stock_movement_in_updates_quantity(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product': self.product.id,
            'movement_type': 'IN',
            'quantity': 5,
            'reason': 'Reposicao de Fornecedor',
            'reference_doc': 'NF-1002',
            'notes': 'Entrada para teste automatizado'
        }
        response = self.client.post('/api/inventory/movements/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 15)

    def test_stock_movement_out_prevents_negative_stock(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product': self.product.id,
            'movement_type': 'OUT',
            'quantity': 999,
            'reason': 'Tentativa de saida excessiva',
            'notes': 'Tentativa de saida excessiva'
        }
        response = self.client.post('/api/inventory/movements/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 10)

    def test_dashboard_summary_endpoint(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/inventory/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('total_products', response.data['summary'])
