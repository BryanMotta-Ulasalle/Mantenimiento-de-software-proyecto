from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlsplit
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Role, User


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_URL='https://tienda.example.com',
)
class PasswordResetTests(APITestCase):
    OLD_PASSWORD = 'InitialPassword123'
    NEW_PASSWORD = 'CambiaMiClave!37'

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email='cliente@example.com',
            name='Cliente',
            password=cls.OLD_PASSWORD,
            role=Role.objects.get(name='Customer'),
        )

    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.request_url = reverse('password-reset')
        self.confirm_url = reverse('password-reset-confirm')

    def make_payload(self, token=None):
        return {
            'uid': urlsafe_base64_encode(force_bytes(self.user.pk)),
            'token': token or default_token_generator.make_token(self.user),
            'new_password': self.NEW_PASSWORD,
        }

    def test_email_link_resets_password_once_and_new_password_can_log_in(self):
        response = self.client.post(self.request_url, {'email': self.user.email.upper()}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.user.email])
        link = next(line for line in mail.outbox[0].body.splitlines() if line.startswith('https://'))
        url = urlsplit(link)
        self.assertEqual((url.netloc, url.path), ('tienda.example.com', '/restablecer-contrasena'))
        params = parse_qs(url.fragment)
        payload = {'uid': params['uid'][0], 'token': params['token'][0], 'new_password': self.NEW_PASSWORD}

        response = self.client.post(self.confirm_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        response = self.client.post(self.confirm_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        login = reverse('login')
        response = self.client.post(login, {'email': self.user.email, 'password': self.OLD_PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.post(login, {'email': self.user.email, 'password': self.NEW_PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_request_response_does_not_disclose_unknown_or_inactive_accounts(self):
        known = self.client.post(self.request_url, {'email': self.user.email}, format='json')
        unknown = self.client.post(self.request_url, {'email': 'unknown@example.com'}, format='json')
        self.user.is_active = False
        self.user.save(update_fields=['is_active'])
        inactive = self.client.post(self.request_url, {'email': self.user.email}, format='json')

        self.assertEqual((unknown.status_code, unknown.data), (known.status_code, known.data))
        self.assertEqual((inactive.status_code, inactive.data), (known.status_code, known.data))
        self.assertEqual(len(mail.outbox), 1)

    def test_expired_or_invalid_link_does_not_change_password(self):
        earlier = datetime.now() - timedelta(seconds=settings.PASSWORD_RESET_TIMEOUT + 1)
        with patch.object(default_token_generator, '_now', return_value=earlier):
            expired_token = default_token_generator.make_token(self.user)
        for token in (expired_token, 'invalid-token'):
            with self.subTest(token=token):
                response = self.client.post(self.confirm_url, self.make_payload(token), format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.OLD_PASSWORD))

    def test_weak_password_is_rejected_without_consuming_link(self):
        payload = self.make_payload()
        response = self.client.post(self.confirm_url, {**payload, 'new_password': '123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)
        response = self.client.post(self.confirm_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_requests_are_rate_limited(self):
        for _ in range(5):
            response = self.client.post(self.request_url, {'email': 'unknown@example.com'}, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.post(self.request_url, {'email': 'unknown@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
