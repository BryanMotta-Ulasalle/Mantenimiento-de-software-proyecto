from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import Role, User


class PublicRegistrationTests(APITestCase):
    def setUp(self):
        self.customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={"name": "Customer"},
        )
        self.admin_role, _ = Role.objects.get_or_create(
            id=1,
            defaults={"name": "Admin"},
        )
        self.url = reverse("register")

    def test_public_registration_creates_customer(self):
        response = self.client.post(
            self.url,
            {
                "name": "Nuevo Cliente",
                "email": "cliente@example.com",
                "password": "Password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="cliente@example.com")
        self.assertEqual(user.role, self.customer_role)

    def test_public_registration_ignores_admin_role_id(self):
        response = self.client.post(
            self.url,
            {
                "name": "Cliente Seguro",
                "email": "seguro@example.com",
                "password": "Password123",
                "role_id": self.admin_role.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="seguro@example.com")
        self.assertEqual(user.role, self.customer_role)
        self.assertNotEqual(user.role, self.admin_role)


class RolePermissionTests(APITestCase):
    def setUp(self):
        self.customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={"name": "Customer"},
        )
        self.admin_role, _ = Role.objects.get_or_create(
            id=1,
            defaults={"name": "Admin"},
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            password="Password123",
            name="Customer",
            role=self.customer_role,
        )
        self.url = reverse("roles-list")

    def test_customer_cannot_create_role(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            self.url,
            {"name": "Unauthorized Role"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Role.objects.filter(name="Unauthorized Role").exists())


class UserRoleEscalationTests(APITestCase):
    def setUp(self):
        self.customer_role, _ = Role.objects.get_or_create(
            id=3,
            defaults={"name": "Customer"},
        )
        self.admin_role, _ = Role.objects.get_or_create(
            id=1,
            defaults={"name": "Admin"},
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            password="Password123",
            name="Customer",
            role=self.customer_role,
        )

    def test_customer_cannot_change_own_role_through_users_endpoint(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.patch(
            reverse("users-detail", args=[self.customer.id]),
            {"role_id": self.admin_role.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.role, self.customer_role)


class UserMeEndpointTests(APITestCase):
    def setUp(self):
        self.customer_role, _ = Role.objects.get_or_create(id=3, defaults={"name": "Customer"})
        self.admin_role, _ = Role.objects.get_or_create(id=1, defaults={"name": "Admin"})

        self.user = User.objects.create_user(
            email="user@example.com",
            password="Password123",
            name="Usuario Inicial",
            role=self.customer_role,
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="Password123",
            name="Otro Usuario",
            role=self.admin_role,
        )

        self.url = reverse("users-me")

    def test_authenticated_user_can_update_own_name_and_email(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            self.url,
            {
                "name": "Usuario Actualizado",
                "email": "nuevo@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()

        self.assertEqual(self.user.name, "Usuario Actualizado")
        self.assertEqual(self.user.email, "nuevo@example.com")

    def test_me_update_requires_authentication(self):
        response = self.client.patch(
            self.url,
            {
                "name": "Sin Auth",
                "email": "sinauth@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_update_rejects_duplicate_email(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            self.url,
            {
                "email": self.other_user.email,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
