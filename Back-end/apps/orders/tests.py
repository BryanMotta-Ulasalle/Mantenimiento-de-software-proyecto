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
