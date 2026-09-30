from datetime import datetime
from decimal import Decimal

from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.orders.models import Order
from apps.products.models import Category, Product
from apps.users.models import Role, User


class DashboardSummaryTests(APITestCase):
    def setUp(self):
        self.admin_role, _ = Role.objects.get_or_create(
            id=1,
            defaults={'name': 'Admin'},
        )
        self.customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={'name': 'Customer'},
        )
        self.admin = self.create_user('admin@example.com', self.admin_role)
        self.customer = self.create_user(
            'customer@example.com',
            self.customer_role,
        )
        self.technology = Category.objects.create(name='Tecnología')
        self.office = Category.objects.create(name='Oficina')
        self.create_product('Mouse', self.technology, 5)
        self.create_product('Teclado', self.technology, 8)
        self.create_product('Silla', self.office, 0)
        self.june_order = self.create_order('100.00', 2026, 6, 12)
        self.july_order = self.create_order('250.50', 2026, 7, 3)
        self.url = reverse('dashboard-summary')

    @staticmethod
    def create_user(email, role):
        return User.objects.create_user(
            email=email,
            password='Password123',
            name=role.name,
            role=role,
        )

    @staticmethod
    def create_product(name, category, stock):
        return Product.objects.create(
            name=name,
            category=category,
            description='Producto de prueba',
            price=Decimal('20.00'),
            stock=stock,
            status=True,
        )

    def create_order(self, total, year, month, day):
        order = Order.objects.create(
            user=self.customer,
            total_price=Decimal(total),
            shipping_address='Av. Principal 123',
        )
        Order.objects.filter(id=order.id).update(
            created_at=timezone.make_aware(datetime(year, month, day)),
        )
        order.refresh_from_db()
        return order

    def test_admin_receives_correct_summary_and_aggregations(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary'], {
            'products': 3,
            'categories': 2,
            'users': 2,
            'orders': 2,
            'order_amount': '350.50',
            'low_stock_products': 2,
            'low_stock_threshold': 5,
        })
        self.assertEqual(
            response.data['orders_by_month'],
            [
                {'month': '2026-06', 'label': 'Junio', 'total': '100.00'},
                {'month': '2026-07', 'label': 'Julio', 'total': '250.50'},
            ],
        )
        self.assertEqual(
            {
                item['category']: item['count']
                for item in response.data['products_by_category']
            },
            {'Tecnología': 2, 'Oficina': 1},
        )
        self.assertEqual(
            {
                item['product']: (item['category'], item['stock'])
                for item in response.data['low_stock_items']
            },
            {
                'Mouse': ('Tecnología', 5),
                'Silla': ('Oficina', 0),
            },
        )

    def test_customer_cannot_access_summary(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_access_summary(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DashboardEmptyDataTests(APITestCase):
    def test_admin_receives_empty_chart_data_without_orders_or_products(self):
        admin_role, _ = Role.objects.get_or_create(
            id=1,
            defaults={'name': 'Admin'},
        )
        admin = User.objects.create_user(
            email='admin@example.com',
            password='Password123',
            name='Admin',
            role=admin_role,
        )
        self.client.force_authenticate(user=admin)

        response = self.client.get(reverse('dashboard-summary'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['products'], 0)
        self.assertEqual(response.data['summary']['orders'], 0)
        self.assertEqual(response.data['summary']['order_amount'], '0.00')
        self.assertEqual(response.data['summary']['low_stock_products'], 0)
        self.assertEqual(response.data['orders_by_month'], [])
        self.assertEqual(response.data['products_by_category'], [])
        self.assertEqual(response.data['low_stock_items'], [])
