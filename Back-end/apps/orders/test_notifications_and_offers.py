from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.db import IntegrityError
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.products.models import Category, Product
from apps.users.models import Role, ShippingDestination, User
from .models import Cart, CartItem, Order, OrderNotification


class OrderExtensionsTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user(email='customer@example.com', name='Customer', role=Role.objects.get(name='Customer'))
        cls.other = User.objects.create_user(email='other@example.com', name='Other', role=Role.objects.get(name='Customer'))
        cls.admin = User.objects.create_user(email='admin@example.com', name='Admin', role=Role.objects.get(name='Admin'))
        category = Category.objects.create(name='Ropa')
        cls.product = Product.objects.create(
            category=category, name='Polo', description='Polo XL', price='50.00', stock=5,
            offer_enabled=True, offer_price='35.00',
            offer_starts_at=timezone.now() - timedelta(days=1), offer_ends_at=timezone.now() + timedelta(days=1),
        )
        cls.order = Order.objects.create(user=cls.customer, total_price='50.00', shipping_address='Casa 123')
        cls.cart = Cart.objects.create(user=cls.customer)
        CartItem.objects.create(cart=cls.cart, product=cls.product, quantity=2)

    def test_notification_is_atomic_idempotent_and_visible_only_to_owner(self):
        self.client.force_authenticate(self.admin)
        url = reverse('order-status', args=[self.order.pk])
        for _ in range(2):
            response = self.client.patch(url, {'status': 'processing'}, format='json')
            self.assertEqual(response.status_code, 200)
        self.assertEqual(OrderNotification.objects.count(), 1)
        notification = OrderNotification.objects.get()
        self.client.force_authenticate(self.other)
        response = self.client.get(reverse('notification-list'))
        self.assertEqual(response.data, {'unread_count': 0, 'results': []})
        self.assertEqual(self.client.post(reverse('notification-read', args=[notification.pk])).status_code, 404)
        self.client.force_authenticate(self.customer)
        response = self.client.get(reverse('notification-list'))
        self.assertEqual(response.data['unread_count'], 1)
        self.assertEqual(response.data['results'][0]['order_id'], self.order.pk)
        self.assertEqual(self.client.post(reverse('notification-read', args=[notification.pk])).status_code, 200)
        self.assertEqual(self.client.post(reverse('notification-read-all')).status_code, 200)
        self.assertEqual(self.client.get(reverse('notification-list')).data['unread_count'], 0)

    def test_failed_notification_rolls_back_order_status(self):
        self.client.force_authenticate(self.admin)
        with patch.object(OrderNotification.objects, 'create', side_effect=IntegrityError):
            with self.assertRaises(IntegrityError):
                self.client.patch(reverse('order-status', args=[self.order.pk]), {'status': 'processing'}, format='json')
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'pending')

    def test_checkout_preserves_offer_price_and_shipping_snapshot(self):
        destination = ShippingDestination.objects.create(user=self.customer, label='Casa', address='Casa 123', phone='999888777', is_default=True)
        self.client.force_authenticate(self.customer)
        cart_response = self.client.get(reverse('cart-list'))
        self.assertEqual(Decimal(str(cart_response.data[0]['total_price'])), Decimal('70.00'))
        response = self.client.post(reverse('order-list'), {
            'shipping_address': destination.address, 'shipping_phone': '+51 999-888-777', 'expected_total': '70.00',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        order = Order.objects.get(pk=response.data['id'])
        self.assertEqual(order.shipping_phone, '+51999888777')
        self.assertEqual(order.items.get().unit_price, Decimal('35.00'))
        destination.address = 'Otra casa 456'
        destination.save()
        self.product.price = Decimal('60.00')
        self.product.save()
        order.refresh_from_db()
        self.assertEqual(order.shipping_address, 'Casa 123')
        self.assertEqual(order.total_price, Decimal('70.00'))

    def test_expired_offer_requires_customer_to_review_total(self):
        self.product.offer_ends_at = timezone.now() - timedelta(seconds=1)
        self.product.save()
        self.client.force_authenticate(self.customer)
        response = self.client.post(reverse('order-list'), {'shipping_address': 'Casa 123', 'expected_total': '70.00'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('price_changed', response.data)
        self.assertTrue(CartItem.objects.filter(cart=self.cart).exists())
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)
