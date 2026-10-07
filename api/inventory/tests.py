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

    def test_archive_and_unarchive_product(self):
        self.client.force_authenticate(user=self.user)
        # Arquivar produto
        res_archive = self.client.post(f'/api/inventory/products/{self.product.id}/archive/', {
            'reason': 'Item descontinuado pelo fabricante'
        })
        self.assertEqual(res_archive.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertTrue(self.product.is_archived)
        self.assertEqual(self.product.archive_reason, 'Item descontinuado pelo fabricante')

        # Listagem padrao nao deve exibir arquivados
        res_list = self.client.get('/api/inventory/products/')
        products_list = res_list.data.get('results', res_list.data) if isinstance(res_list.data, dict) else res_list.data
        self.assertFalse(any(p['id'] == self.product.id for p in products_list))

        # Listagem de arquivados deve exibir
        res_archived = self.client.get('/api/inventory/products/?archived=true')
        archived_list = res_archived.data.get('results', res_archived.data) if isinstance(res_archived.data, dict) else res_archived.data
        self.assertTrue(any(p['id'] == self.product.id for p in archived_list))

        # Desarquivar produto
        res_unarchive = self.client.post(f'/api/inventory/products/{self.product.id}/unarchive/')
        self.assertEqual(res_unarchive.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertFalse(self.product.is_archived)

    def test_delivery_dispatch_reduces_stock_and_creates_tracking(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product': self.product.id,
            'quantity': 3,
            'recipient_name': 'Cliente Corporativo XYZ',
            'recipient_address': 'Av. Paulista, 1000 - Sao Paulo/SP',
            'carrier': 'LOGGI',
            'shipping_cost': '25.50'
        }
        response = self.client.post('/api/inventory/deliveries/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tracking_code', response.data)
        self.assertIn('external_delivery_url', response.data)
        self.assertTrue(response.data['tracking_code'].startswith('LG'))
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 7)  # 10 - 3 = 7

    def test_cannot_dispatch_archived_product(self):
        self.client.force_authenticate(user=self.user)
        self.product.is_archived = True
        self.product.save()

        payload = {
            'product': self.product.id,
            'quantity': 1,
            'recipient_name': 'Cliente Teste',
            'recipient_address': 'Rua Exemplo, 123',
            'carrier': 'CORREIOS'
        }
        response = self.client.post('/api/inventory/deliveries/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

