from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Role, ShippingDestination, User


class DestinationTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        role = Role.objects.get(name='Customer')
        cls.user = User.objects.create_user(email='shipping@example.com', name='Customer', role=role)
        cls.other = User.objects.create_user(email='other@example.com', name='Other', role=role)

    def setUp(self):
        self.client.force_authenticate(self.user)
        self.url = reverse('shipping-destination-list')

    def create_destination(self, label, preferred=False):
        response = self.client.post(self.url, {'label': label, 'address': 'Av. Principal 123', 'phone': '+51 999 888 777', 'is_default': preferred}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        return response.data

    def test_default_changes_and_deletion_preserve_exactly_one_preferred_destination(self):
        first = self.create_destination('Casa')
        self.assertTrue(first['is_default'])
        self.assertEqual(first['phone'], '+51999888777')
        second = self.create_destination('Trabajo', True)
        self.assertEqual(ShippingDestination.objects.filter(user=self.user, is_default=True).count(), 1)
        url = reverse('shipping-destination-detail', args=[second['id']])
        self.assertEqual(self.client.patch(url, {'is_default': False}, format='json').status_code, 400)
        self.assertEqual(self.client.delete(url).status_code, 204)
        url = reverse('shipping-destination-detail', args=[first['id']])
        self.assertEqual(self.client.delete(url).status_code, 400)
        self.assertTrue(ShippingDestination.objects.get(pk=first['id']).is_default)

    def test_other_users_cannot_read_or_edit_and_invalid_phone_is_rejected(self):
        destination = self.create_destination('Casa')
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(self.url).data, [])
        url = reverse('shipping-destination-detail', args=[destination['id']])
        self.assertEqual(self.client.patch(url, {'phone': '999888777'}, format='json').status_code, 404)
        response = self.client.post(self.url, {'label': 'Casa', 'address': 'Av. 123', 'phone': 'hola'}, format='json')
        self.assertEqual(response.status_code, 400)
