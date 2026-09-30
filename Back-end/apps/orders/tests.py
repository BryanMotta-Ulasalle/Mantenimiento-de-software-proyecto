from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.orders.models import Cart, CartItem, Order
from apps.products.models import Category, Product
from apps.users.models import Role, User


class OrderStockTests(APITestCase):
    def setUp(self):
        customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={"name": "Customer"},
        )
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="Password123",
            name="Customer",
            role=customer_role,
        )
        self.category = Category.objects.create(
            name="Categoria",
            description="Categoria de prueba",
        )
        self.product = Product.objects.create(
            category=self.category,
            name="Producto",
            description="Producto de prueba",
            price=Decimal("25.00"),
            stock=2,
            status=True,
        )
        self.cart = Cart.objects.create(user=self.user)
        self.url = reverse("order-list")
        self.client.force_authenticate(user=self.user)

    def test_order_rejects_insufficient_stock(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=3,
        )

        response = self.client.post(
            self.url,
            {"shipping_address": "Av. Principal 123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("stock", response.data)
        self.assertFalse(Order.objects.filter(user=self.user).exists())
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)
        self.assertTrue(self.cart.items.exists())

    def test_order_decrements_stock_and_clears_cart(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

        response = self.client.post(
            self.url,
            {"shipping_address": "Av. Principal 123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)
        self.assertFalse(self.cart.items.exists())

        order = Order.objects.get(user=self.user)
        self.assertEqual(order.total_price, Decimal('50.00'))
        self.assertEqual(order.items.count(), 1)

    def test_empty_cart_does_not_create_order(self):
        response = self.client.post(
            self.url,
            {'shipping_address': 'Av. Principal 123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Order.objects.filter(user=self.user).exists())

    def test_order_creation_ignores_submitted_created_at(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )
        submitted_created_at = '2000-01-01T00:00:00Z'

        response = self.client.post(
            self.url,
            {
                'shipping_address': 'Av. Principal 123',
                'created_at': submitted_created_at,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('created_at', response.data)
        self.assertIsNotNone(response.data['created_at'])
        self.assertNotEqual(response.data['created_at'], submitted_created_at)


class OrderCreatedAtContractTests(APITestCase):
    def setUp(self):
        customer_role, _ = Role.objects.get_or_create(name='Customer')
        admin_role, _ = Role.objects.get_or_create(name='Admin')
        self.customer = User.objects.create_user(
            email='orders-customer@example.com',
            password='Password123',
            name='Customer',
            role=customer_role,
        )
        self.other_customer = User.objects.create_user(
            email='orders-other@example.com',
            password='Password123',
            name='Other customer',
            role=customer_role,
        )
        self.admin = User.objects.create_user(
            email='orders-admin@example.com',
            password='Password123',
            name='Admin',
            role=admin_role,
        )
        self.customer_order = Order.objects.create(
            user=self.customer,
            total_price=Decimal('10.00'),
            shipping_address='Av. Cliente 123',
        )
        self.other_order = Order.objects.create(
            user=self.other_customer,
            total_price=Decimal('20.00'),
            shipping_address='Av. Otro 456',
        )

    def test_customer_list_and_detail_include_generated_created_at(self):
        self.client.force_authenticate(user=self.customer)

        list_response = self.client.get(reverse('order-list'))
        detail_response = self.client.get(
            reverse('order-detail', args=[self.customer_order.id]),
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [order['id'] for order in list_response.data],
            [self.customer_order.id],
        )
        self.assertIn('created_at', list_response.data[0])
        self.assertIsNotNone(list_response.data[0]['created_at'])

        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertIn('created_at', detail_response.data)
        self.assertIsNotNone(detail_response.data['created_at'])

    def test_admin_list_includes_orders_and_created_at(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse('order-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            {order['id'] for order in response.data},
            {self.customer_order.id, self.other_order.id},
        )
        self.assertTrue(
            all(order['created_at'] is not None for order in response.data),
        )

    def test_created_at_is_read_only_in_serializer(self):
        from apps.orders.serializers import OrderSerializer

        serializer = OrderSerializer(
            instance=self.customer_order,
            data={'created_at': '2000-01-01T00:00:00Z'},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertNotIn('created_at', serializer.validated_data)


class OrderItemPermissionTests(APITestCase):
    def setUp(self):
        customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={"name": "Customer"},
        )
        self.user = User.objects.create_user(
            email="items@example.com",
            password="Password123",
            name="Customer",
            role=customer_role,
        )
        self.category = Category.objects.create(name="Categoria")
        self.product = Product.objects.create(
            category=self.category,
            name="Producto",
            description="Producto de prueba",
            price=Decimal("10.00"),
            stock=5,
            status=True,
        )
        self.order = Order.objects.create(
            user=self.user,
            total_price=Decimal("10.00"),
            shipping_address="Av. Principal 123",
        )
        self.client.force_authenticate(user=self.user)

    def test_order_items_cannot_be_created_directly(self):
        response = self.client.post(
            reverse("orderitem-list"),
            {
                "order": self.order.id,
                "product": self.product.id,
                "quantity": 1,
                "unit_price": "10.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_orders_cannot_be_deleted_directly(self):
        response = self.client.delete(
            reverse("order-detail", args=[self.order.id]),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )
        self.assertTrue(Order.objects.filter(id=self.order.id).exists())
