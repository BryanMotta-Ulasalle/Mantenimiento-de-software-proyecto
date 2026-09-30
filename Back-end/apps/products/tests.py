from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Category, Product
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

