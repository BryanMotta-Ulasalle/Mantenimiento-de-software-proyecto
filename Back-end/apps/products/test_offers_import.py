from datetime import timedelta
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.users.models import Role, User
from .models import Category, Product, ProductImport


class OffersAndImportTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_user(email='offers@example.com', name='Admin', role=Role.objects.get(name='Admin'))
        cls.customer = User.objects.create_user(email='customer@example.com', name='Customer', role=Role.objects.get(name='Customer'))
        cls.employee = User.objects.create_user(email='employee@example.com', name='Employee', role=Role.objects.get(name='Employee'))
        cls.category = Category.objects.create(name='Ropa')
        cls.product = Product.objects.create(category=cls.category, name='Polo', description='Polo XL', price='50.00', stock=100)

    def setUp(self):
        self.client.force_authenticate(self.admin)
        self.offer = {'offer_price': '35.00', 'offer_enabled': True, 'offer_starts_at': (timezone.now() - timedelta(days=1)).isoformat(), 'offer_ends_at': (timezone.now() + timedelta(days=1)).isoformat()}

    def test_manual_offer_is_independent_of_low_stock_and_validated(self):
        url = reverse('product-detail', args=[self.product.pk])
        response = self.client.patch(url, self.offer, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(response.data['is_on_offer'])
        self.assertEqual(Decimal(response.data['effective_price']), Decimal('35.00'))
        response = self.client.patch(url, {'offer_price': '60.00'}, format='json')
        self.assertEqual(response.status_code, 400)
        response = self.client.patch(url, {'offer_ends_at': self.offer['offer_starts_at']}, format='json')
        self.assertEqual(response.status_code, 400)
        self.client.force_authenticate(self.employee)
        self.assertEqual(self.client.patch(url, self.offer, format='json').status_code, 400)

    def test_offers_hide_when_sold_out_or_expired_but_product_stays_in_catalog(self):
        self.client.patch(reverse('product-detail', args=[self.product.pk]), self.offer, format='json')
        self.client.force_authenticate(None)
        self.assertEqual(len(self.client.get(reverse('product-list'), {'offers': 'true'}).data), 1)
        for stock, enabled, expired in ((0, True, False), (5, True, True), (5, False, False)):
            Product.objects.filter(pk=self.product.pk).update(stock=stock, offer_enabled=enabled, offer_ends_at=timezone.now() + timedelta(days=-1 if expired else 1))
            self.assertEqual(self.client.get(reverse('product-list'), {'offers': 'true'}).data, [])
            response = self.client.get(reverse('product-detail', args=[self.product.pk]))
            self.assertEqual(response.status_code, 200)
            self.assertFalse(response.data['is_on_offer'])

    def preview(self, content):
        return self.client.post(reverse('product-import-preview'), {'file': SimpleUploadedFile('productos.csv', content.encode('utf-8-sig'), content_type='text/csv')}, format='multipart')

    def test_csv_preview_normalizes_and_confirmation_is_idempotent(self):
        response = self.preview('nombre;descripcion;categoria;precio;stock;activo\n  Casaca   M ;Casaca de invierno; ropa ;29,90;5;SÍ\n')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['valid_count'], 1)
        self.assertFalse(Product.objects.filter(name='Casaca M').exists())
        payload = {'batch_id': response.data['batch_id']}
        self.client.force_authenticate(self.employee)
        self.assertEqual(self.client.post(reverse('product-import-confirm'), payload, format='json').status_code, 404)
        self.client.force_authenticate(self.admin)
        for _ in range(2):
            response = self.client.post(reverse('product-import-confirm'), payload, format='json')
            self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(Product.objects.filter(name='Casaca M', price=Decimal('29.90'), stock=5).count(), 1)

    def test_invalid_csv_reports_all_rows_without_writing_products(self):
        response = self.preview('nombre;descripcion;categoria;precio;stock\nPolo;Duplicado;Ropa;50;1\n;Sin nombre;Desconocida;nan;-3\nOtro;Desc;Ropa;10;1.5\n')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertIsNone(response.data['batch_id'])
        self.assertEqual(len(response.data['rows']), 3)
        self.assertTrue(all(row['errors'] for row in response.data['rows']))
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(ProductImport.objects.count(), 0)

    def test_csv_permissions_malformed_headers_and_concurrent_catalog_change(self):
        self.assertEqual(self.preview('nombre;nombre\nUno;Dos').status_code, 400)
        response = self.preview('nombre;descripcion;categoria;precio;stock\nCasaca;Descripción;Ropa;30;5\n')
        payload = {'batch_id': response.data['batch_id']}
        Product.objects.create(category=self.category, name='Casaca', description='Otra', price='30', stock=5)
        response = self.client.post(reverse('product-import-confirm'), payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.preview('nombre;descripcion;categoria;precio;stock\n').status_code, 403)
