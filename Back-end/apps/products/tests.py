from decimal import Decimal
from datetime import datetime

from django.db import IntegrityError, transaction
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Category, Favorite, Product
from apps.users.models import Role, User


class CategoryPermissionTests(APITestCase):
    def setUp(self):
        self.admin_role, _ = Role.objects.get_or_create(
            id=1,
            defaults={"name": "Admin"},
        )
        self.employee_role, _ = Role.objects.get_or_create(
            id=2,
            defaults={"name": "Employee"},
        )
        self.customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={"name": "Customer"},
        )
        self.admin = self._create_user("admin@example.com", self.admin_role)
        self.employee = self._create_user(
            "employee@example.com",
            self.employee_role,
        )
        self.customer = self._create_user(
            "customer@example.com",
            self.customer_role,
        )
        self.url = reverse("category-list")

    @staticmethod
    def _create_user(email, role):
        return User.objects.create_user(
            email=email,
            password="Password123",
            name=role.name,
            role=role,
        )

    def test_categories_are_publicly_readable(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customer_cannot_create_category(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            self.url,
            {"name": "No autorizada", "description": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Category.objects.filter(name="No autorizada").exists())

    def test_admin_can_create_category(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.url,
            {"name": "Categoria Admin", "description": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_employee_can_create_category(self):
        self.client.force_authenticate(user=self.employee)

        response = self.client.post(
            self.url,
            {"name": "Categoria Employee", "description": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ProductFilteringTests(APITestCase):
    def setUp(self):
        self.technology = Category.objects.create(name='Tecnología')
        self.office = Category.objects.create(name='Oficina')
        self.mouse_gamer = self._create_product(
            name='Mouse Gamer',
            category=self.technology,
            stock=8,
            status=True,
        )
        self.mouse_wireless = self._create_product(
            name='MOUSE inalámbrico',
            category=self.technology,
            stock=0,
            status=False,
        )
        self.keyboard = self._create_product(
            name='Teclado mecánico',
            category=self.office,
            stock=4,
            status=True,
        )
        self.list_url = reverse('product-list')

    @staticmethod
    def _create_product(name, category, stock, status):
        return Product.objects.create(
            name=name,
            category=category,
            description='Producto de prueba',
            price=Decimal('99.90'),
            stock=stock,
            status=status,
        )

    def get_product_ids(self, params=None):
        response = self.client.get(self.list_url, params or {})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return {product['id'] for product in response.data}

    def test_products_are_publicly_readable_without_filters(self):
        self.assertEqual(
            self.get_product_ids(),
            {self.mouse_gamer.id, self.mouse_wireless.id, self.keyboard.id},
        )

    def test_search_is_case_insensitive(self):
        self.assertEqual(
            self.get_product_ids({'search': 'mouse'}),
            {self.mouse_gamer.id, self.mouse_wireless.id},
        )

    def test_filter_by_category(self):
        self.assertEqual(
            self.get_product_ids({'category': self.technology.id}),
            {self.mouse_gamer.id, self.mouse_wireless.id},
        )

    def test_filter_by_active_status(self):
        self.assertEqual(
            self.get_product_ids({'is_active': 'true'}),
            {self.mouse_gamer.id, self.keyboard.id},
        )
        self.assertEqual(
            self.get_product_ids({'is_active': 'false'}),
            {self.mouse_wireless.id},
        )

    def test_filter_products_with_stock(self):
        self.assertEqual(
            self.get_product_ids({'stock': 'available'}),
            {self.mouse_gamer.id, self.keyboard.id},
        )

    def test_filter_products_without_stock(self):
        self.assertEqual(
            self.get_product_ids({'stock': 'out'}),
            {self.mouse_wireless.id},
        )

    def test_filters_can_be_combined(self):
        self.assertEqual(
            self.get_product_ids({
                'search': 'mouse',
                'category': self.technology.id,
                'is_active': 'true',
                'stock': 'available',
            }),
            {self.mouse_gamer.id},
        )

    def test_filters_without_matches_return_an_empty_list(self):
        self.assertEqual(self.get_product_ids({'search': 'monitor'}), set())


class ProductOrderingTests(APITestCase):
    def setUp(self):
        self.technology = Category.objects.create(name='Tecnologia')
        self.office = Category.objects.create(name='Oficina')
        self.alpha = self._create_product(
            name='Alfa',
            category=self.technology,
            price='30.00',
            stock=3,
            status=True,
            created_at=datetime(2026, 1, 1, 9, 0),
        )
        self.mouse_basic = self._create_product(
            name='Mouse Basico',
            category=self.technology,
            price='10.00',
            stock=1,
            status=True,
            created_at=datetime(2026, 1, 2, 9, 0),
        )
        self.mouse_premium = self._create_product(
            name='Mouse Premium',
            category=self.technology,
            price='25.00',
            stock=5,
            status=True,
            created_at=datetime(2026, 1, 3, 9, 0),
        )
        self.mouse_inactive = self._create_product(
            name='Mouse Inactivo',
            category=self.technology,
            price='20.00',
            stock=0,
            status=False,
            created_at=datetime(2026, 1, 4, 9, 0),
        )
        self.zeta = self._create_product(
            name='Zeta',
            category=self.office,
            price='40.00',
            stock=2,
            status=True,
            created_at=datetime(2026, 1, 5, 9, 0),
        )
        self.list_url = reverse('product-list')

    @staticmethod
    def _create_product(name, category, price, stock, status, created_at):
        product = Product.objects.create(
            name=name,
            category=category,
            description='Producto de prueba',
            price=Decimal(price),
            stock=stock,
            status=status,
        )
        Product.objects.filter(id=product.id).update(
            created_at=timezone.make_aware(created_at),
        )
        return product

    def get_ordered_product_ids(self, params=None):
        response = self.client.get(self.list_url, params or {})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return [product['id'] for product in response.data]

    def test_orders_by_name_ascending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': 'name'}),
            [
                self.alpha.id,
                self.mouse_basic.id,
                self.mouse_inactive.id,
                self.mouse_premium.id,
                self.zeta.id,
            ],
        )

    def test_orders_by_name_descending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': '-name'}),
            [
                self.zeta.id,
                self.mouse_premium.id,
                self.mouse_inactive.id,
                self.mouse_basic.id,
                self.alpha.id,
            ],
        )

    def test_orders_by_price_ascending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': 'price'}),
            [
                self.mouse_basic.id,
                self.mouse_inactive.id,
                self.mouse_premium.id,
                self.alpha.id,
                self.zeta.id,
            ],
        )

    def test_orders_by_price_descending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': '-price'}),
            [
                self.zeta.id,
                self.alpha.id,
                self.mouse_premium.id,
                self.mouse_inactive.id,
                self.mouse_basic.id,
            ],
        )

    def test_orders_by_stock_ascending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': 'stock'}),
            [
                self.mouse_inactive.id,
                self.mouse_basic.id,
                self.zeta.id,
                self.alpha.id,
                self.mouse_premium.id,
            ],
        )

    def test_orders_by_stock_descending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': '-stock'}),
            [
                self.mouse_premium.id,
                self.alpha.id,
                self.zeta.id,
                self.mouse_basic.id,
                self.mouse_inactive.id,
            ],
        )

    def test_orders_by_created_at_ascending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': 'created_at'}),
            [
                self.alpha.id,
                self.mouse_basic.id,
                self.mouse_premium.id,
                self.mouse_inactive.id,
                self.zeta.id,
            ],
        )

    def test_orders_by_created_at_descending(self):
        self.assertEqual(
            self.get_ordered_product_ids({'ordering': '-created_at'}),
            [
                self.zeta.id,
                self.mouse_inactive.id,
                self.mouse_premium.id,
                self.mouse_basic.id,
                self.alpha.id,
            ],
        )

    def test_combines_search_and_ordering(self):
        self.assertEqual(
            self.get_ordered_product_ids({
                'search': 'mouse',
                'ordering': '-price',
            }),
            [
                self.mouse_premium.id,
                self.mouse_inactive.id,
                self.mouse_basic.id,
            ],
        )

    def test_combines_category_and_ordering(self):
        self.assertEqual(
            self.get_ordered_product_ids({
                'category': self.technology.id,
                'ordering': 'price',
            }),
            [
                self.mouse_basic.id,
                self.mouse_inactive.id,
                self.mouse_premium.id,
                self.alpha.id,
            ],
        )

    def test_combines_all_r01_filters_and_ordering(self):
        self.assertEqual(
            self.get_ordered_product_ids({
                'search': 'mouse',
                'category': self.technology.id,
                'is_active': 'true',
                'stock': 'available',
                'ordering': '-price',
            }),
            [self.mouse_premium.id, self.mouse_basic.id],
        )

    def test_invalid_ordering_returns_a_validation_error(self):
        response = self.client.get(self.list_url, {'ordering': 'unknown_field'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['ordering'],
            'Criterio de ordenamiento no válido.',
        )

    def test_without_ordering_preserves_id_order(self):
        self.assertEqual(
            self.get_ordered_product_ids(),
            [
                self.alpha.id,
                self.mouse_basic.id,
                self.mouse_premium.id,
                self.mouse_inactive.id,
                self.zeta.id,
            ],
        )


class FavoriteApiTests(APITestCase):
    def setUp(self):
        self.customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={'name': 'Customer'},
        )
        self.other_customer_role, _ = Role.objects.get_or_create(
            name='Customer',
        )
        self.admin_role, _ = Role.objects.get_or_create(name='Admin')
        self.employee_role, _ = Role.objects.get_or_create(name='Employee')
        self.customer = self.create_user('favorite-customer@example.com', self.customer_role)
        self.other_customer = self.create_user(
            'favorite-other@example.com',
            self.other_customer_role,
        )
        self.admin = self.create_user('favorite-admin@example.com', self.admin_role)
        self.employee = self.create_user(
            'favorite-employee@example.com',
            self.employee_role,
        )
        self.category = Category.objects.create(name='Categoria')
        self.product = Product.objects.create(
            category=self.category,
            name='Producto favorito',
            description='Producto para probar favoritos',
            price=Decimal('45.00'),
            stock=4,
            status=True,
        )
        self.inactive_product = Product.objects.create(
            category=self.category,
            name='Producto desactivado',
            description='Producto para probar disponibilidad',
            price=Decimal('20.00'),
            stock=2,
            status=False,
        )
        self.list_url = reverse('favorite-list')

    @staticmethod
    def create_user(email, role):
        return User.objects.create_user(
            email=email,
            password='Password123',
            name=role.name,
            role=role,
        )

    def test_anonymous_user_cannot_list_or_create_favorites(self):
        list_response = self.client.get(self.list_url)
        create_response = self.client.post(
            self.list_url,
            {'product_id': self.product.id},
            format='json',
        )

        self.assertEqual(list_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(create_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_only_customers_can_use_favorites(self):
        for user in (self.admin, self.employee):
            with self.subTest(role=user.role.name):
                self.client.force_authenticate(user=user)
                response = self.client.get(self.list_url)
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_can_add_and_list_a_favorite(self):
        self.client.force_authenticate(user=self.customer)

        create_response = self.client.post(
            self.list_url,
            {'product_id': self.product.id},
            format='json',
        )
        list_response = self.client.get(self.list_url)

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data['product']['id'], self.product.id)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['product']['name'], 'Producto favorito')

    def test_adding_the_same_favorite_is_idempotent(self):
        self.client.force_authenticate(user=self.customer)
        payload = {'product_id': self.product.id}

        first_response = self.client.post(self.list_url, payload, format='json')
        second_response = self.client.post(self.list_url, payload, format='json')

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Favorite.objects.filter(user=self.customer, product=self.product).count(),
            1,
        )

    def test_customer_cannot_add_inactive_product(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            self.list_url,
            {'product_id': self.inactive_product.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('product_id', response.data)
        self.assertFalse(
            Favorite.objects.filter(
                user=self.customer,
                product=self.inactive_product,
            ).exists(),
        )

    def test_favorites_are_isolated_by_customer(self):
        Favorite.objects.create(user=self.customer, product=self.product)
        self.client.force_authenticate(user=self.other_customer)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_customer_cannot_delete_another_customers_favorite(self):
        favorite = Favorite.objects.create(
            user=self.customer,
            product=self.product,
        )
        self.client.force_authenticate(user=self.other_customer)

        response = self.client.delete(
            reverse('favorite-detail', args=[favorite.id]),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Favorite.objects.filter(id=favorite.id).exists())

    def test_customer_can_remove_own_favorite(self):
        favorite = Favorite.objects.create(
            user=self.customer,
            product=self.product,
        )
        self.client.force_authenticate(user=self.customer)

        response = self.client.delete(
            reverse('favorite-detail', args=[favorite.id]),
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Favorite.objects.filter(id=favorite.id).exists())

    def test_inactive_product_remains_listed_and_can_be_removed(self):
        favorite = Favorite.objects.create(
            user=self.customer,
            product=self.product,
        )
        self.product.status = False
        self.product.save(update_fields=['status'])
        self.client.force_authenticate(user=self.customer)

        list_response = self.client.get(self.list_url)
        delete_response = self.client.delete(
            reverse('favorite-detail', args=[favorite.id]),
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertFalse(list_response.data[0]['product']['status'])
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_database_prevents_duplicate_customer_product_pair(self):
        Favorite.objects.create(user=self.customer, product=self.product)

        with self.assertRaises(IntegrityError), transaction.atomic():
            Favorite.objects.create(user=self.customer, product=self.product)

