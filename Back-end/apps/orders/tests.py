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

    def test_order_rejects_stock_that_changed_after_adding_to_cart(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )
        self.product.stock = 1
        self.product.save(update_fields=['stock'])

        response = self.client.post(
            self.url,
            {'shipping_address': 'Av. Principal 123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock', response.data)
        self.assertFalse(Order.objects.filter(user=self.user).exists())
        self.assertTrue(self.cart.items.exists())

    def test_order_rejects_product_that_became_inactive(self):
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
        )
        self.product.status = False
        self.product.save(update_fields=['status'])

        response = self.client.post(
            self.url,
            {'shipping_address': 'Av. Principal 123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('product', response.data)
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
        self.assertEqual(order.status, Order.Status.PENDING)

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


class CartItemValidationTests(APITestCase):
    def setUp(self):
        customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={'name': 'Customer'},
        )
        self.user = User.objects.create_user(
            email='cart-validation@example.com',
            password='Password123',
            name='Cart customer',
            role=customer_role,
        )
        self.category = Category.objects.create(name='Categoria')
        self.product = Product.objects.create(
            category=self.category,
            name='Producto activo',
            description='Producto de prueba',
            price=Decimal('10.00'),
            stock=5,
            status=True,
        )
        self.inactive_product = Product.objects.create(
            category=self.category,
            name='Producto inactivo',
            description='Producto de prueba',
            price=Decimal('10.00'),
            stock=5,
            status=False,
        )
        self.cart = Cart.objects.create(user=self.user)
        self.list_url = reverse('cartitem-list')
        self.client.force_authenticate(user=self.user)

    def create_cart_item(self, product_id, quantity):
        return self.client.post(
            self.list_url,
            {'product_id': product_id, 'quantity': quantity},
            format='json',
        )

    def create_existing_item(self, quantity=1):
        return CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=quantity,
        )

    def test_creates_cart_item_with_valid_quantity(self):
        response = self.create_cart_item(self.product.id, 3)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quantity'], 3)
        self.assertTrue(
            CartItem.objects.filter(cart=self.cart, product=self.product).exists(),
        )

    def test_rejects_zero_quantity_when_creating_cart_item(self):
        response = self.create_cart_item(self.product.id, 0)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

    def test_rejects_negative_quantity_when_creating_cart_item(self):
        response = self.create_cart_item(self.product.id, -1)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

    def test_rejects_quantity_above_stock_when_creating_cart_item(self):
        response = self.create_cart_item(self.product.id, 6)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

    def test_rejects_inactive_product_when_creating_cart_item(self):
        response = self.create_cart_item(self.inactive_product.id, 1)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('product_id', response.data)

    def test_allows_quantity_equal_to_stock_when_creating_cart_item(self):
        response = self.create_cart_item(self.product.id, self.product.stock)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quantity'], self.product.stock)

    def test_updates_cart_item_with_partial_valid_quantity(self):
        item = self.create_existing_item()

        response = self.client.patch(
            reverse('cartitem-detail', args=[item.id]),
            {'quantity': 3},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['quantity'], 3)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 3)

    def test_rejects_zero_quantity_when_updating_cart_item(self):
        item = self.create_existing_item()

        response = self.client.patch(
            reverse('cartitem-detail', args=[item.id]),
            {'quantity': 0},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

    def test_rejects_quantity_above_stock_when_updating_cart_item(self):
        item = self.create_existing_item()

        response = self.client.patch(
            reverse('cartitem-detail', args=[item.id]),
            {'quantity': 6},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

    def test_rejects_update_when_product_became_inactive(self):
        item = self.create_existing_item()
        self.product.status = False
        self.product.save(update_fields=['status'])

        response = self.client.patch(
            reverse('cartitem-detail', args=[item.id]),
            {'quantity': 1},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('product_id', response.data)

    def test_allows_quantity_equal_to_stock_when_updating_cart_item(self):
        item = self.create_existing_item()

        response = self.client.patch(
            reverse('cartitem-detail', args=[item.id]),
            {'quantity': self.product.stock},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['quantity'], self.product.stock)


class OrderStatusUpdateTests(APITestCase):
    def setUp(self):
        self.admin_role, _ = Role.objects.get_or_create(name='Admin')
        self.customer_role, _ = Role.objects.get_or_create(name='Customer')
        self.employee_role, _ = Role.objects.get_or_create(name='Employee')
        self.admin = self.create_user('status-admin@example.com', self.admin_role)
        self.customer = self.create_user(
            'status-customer@example.com',
            self.customer_role,
        )
        self.employee = self.create_user(
            'status-employee@example.com',
            self.employee_role,
        )
        self.order = self.create_order(self.customer)

    @staticmethod
    def create_user(email, role):
        return User.objects.create_user(
            email=email,
            password='Password123',
            name=role.name,
            role=role,
        )

    @staticmethod
    def create_order(user, status_value=Order.Status.PENDING):
        return Order.objects.create(
            user=user,
            status=status_value,
            total_price=Decimal('25.00'),
            shipping_address='Av. Principal 123',
        )

    @staticmethod
    def status_url(order):
        return reverse('order-status', args=[order.id])

    def update_status_as_admin(self, order, status_value, extra_data=None):
        payload = {'status': status_value}
        if extra_data:
            payload.update(extra_data)
        self.client.force_authenticate(user=self.admin)
        return self.client.patch(
            self.status_url(order),
            payload,
            format='json',
        )

    def test_admin_can_change_pending_to_processing(self):
        response = self.update_status_as_admin(
            self.order,
            Order.Status.PROCESSING,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'status': Order.Status.PROCESSING})
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PROCESSING)

    def test_admin_can_change_processing_to_completed(self):
        self.order.status = Order.Status.PROCESSING
        self.order.save(update_fields=['status'])

        response = self.update_status_as_admin(
            self.order,
            Order.Status.COMPLETED,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.COMPLETED)

    def test_admin_can_cancel_pending_order(self):
        response = self.update_status_as_admin(
            self.order,
            Order.Status.CANCELLED,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.CANCELLED)

    def test_admin_can_cancel_processing_order(self):
        self.order.status = Order.Status.PROCESSING
        self.order.save(update_fields=['status'])

        response = self.update_status_as_admin(
            self.order,
            Order.Status.CANCELLED,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.CANCELLED)

    def test_same_status_is_an_idempotent_update(self):
        response = self.update_status_as_admin(
            self.order,
            Order.Status.PENDING,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PENDING)

    def test_customer_cannot_update_order_status(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.patch(
            self.status_url(self.order),
            {'status': Order.Status.PROCESSING},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PENDING)

    def test_anonymous_user_cannot_update_order_status(self):
        response = self.client.patch(
            self.status_url(self.order),
            {'status': Order.Status.PROCESSING},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_employee_cannot_update_order_status(self):
        self.client.force_authenticate(user=self.employee)

        response = self.client.patch(
            self.status_url(self.order),
            {'status': Order.Status.PROCESSING},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_rejects_invalid_transitions(self):
        transitions = (
            (Order.Status.PENDING, Order.Status.COMPLETED),
            (Order.Status.COMPLETED, Order.Status.PENDING),
            (Order.Status.COMPLETED, Order.Status.PROCESSING),
            (Order.Status.COMPLETED, Order.Status.CANCELLED),
            (Order.Status.CANCELLED, Order.Status.PENDING),
            (Order.Status.CANCELLED, Order.Status.PROCESSING),
            (Order.Status.CANCELLED, Order.Status.COMPLETED),
        )

        for current_status, requested_status in transitions:
            with self.subTest(
                current_status=current_status,
                requested_status=requested_status,
            ):
                order = self.create_order(self.customer, current_status)
                response = self.update_status_as_admin(order, requested_status)

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                order.refresh_from_db()
                self.assertEqual(order.status, current_status)

    def test_rejects_invalid_status_value(self):
        response = self.update_status_as_admin(self.order, 'shipped')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PENDING)

    def test_status_endpoint_updates_only_status(self):
        original_user_id = self.order.user_id
        original_total = self.order.total_price
        original_address = self.order.shipping_address

        response = self.update_status_as_admin(
            self.order,
            Order.Status.PROCESSING,
            {
                'total_price': '1.00',
                'shipping_address': 'Otra dirección',
                'user': 999,
                'created_at': '2000-01-01T00:00:00Z',
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PROCESSING)
        self.assertEqual(self.order.user_id, original_user_id)
        self.assertEqual(self.order.total_price, original_total)
        self.assertEqual(self.order.shipping_address, original_address)

    def test_generic_order_patch_remains_unavailable(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            reverse('order-detail', args=[self.order.id]),
            {'status': Order.Status.PROCESSING},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


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
