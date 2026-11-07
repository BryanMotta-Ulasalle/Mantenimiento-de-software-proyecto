from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import Role, User
from .models import Category, Product, ProductImage


class ProductImageApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        category = Category.objects.create(name='Ropa')
        cls.product = Product.objects.create(
            category=category, name='Polo', description='Polo XL', price='49.90', stock=5,
        )
        cls.other_product = Product.objects.create(
            category=category, name='Camisa', description='Camisa M', price='59.90', stock=5,
        )
        for role_name in ('Admin', 'Employee', 'Customer'):
            user = User.objects.create_user(
                email=f'{role_name.lower()}@example.com',
                name=role_name,
                role=Role.objects.get(name=role_name),
            )
            setattr(cls, role_name.lower(), user)

    def setUp(self):
        media_dir = TemporaryDirectory()
        self.addCleanup(media_dir.cleanup)
        media_settings = override_settings(MEDIA_ROOT=media_dir.name)
        media_settings.enable()
        self.addCleanup(media_settings.disable)
        self.media_dir = Path(media_dir.name)
        self.upload_url = reverse('product-upload-image', args=[self.product.pk])

    @staticmethod
    def image_file(image_format='PNG'):
        content = BytesIO()
        Image.new('RGB', (4, 4), 'blue').save(content, format=image_format)
        return SimpleUploadedFile(f'Foto de prueba.{image_format.lower()}', content.getvalue())

    def test_employee_uploads_first_image_as_primary_and_public_api_returns_url(self):
        self.client.force_authenticate(self.employee)
        response = self.client.post(self.upload_url, {'image_file': self.image_file()}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        image = self.product.product_images.get()
        self.assertTrue(image.is_main)
        self.assertRegex(image.image_file.name, r'^products/[a-f0-9]{32}\.png$')
        self.assertTrue((self.media_dir / image.image_file.name).is_file())

        self.client.force_authenticate(None)
        public_response = self.client.get(reverse('product-detail', args=[self.product.pk]))
        self.assertEqual(public_response.data['product_images'], [{
            'id': image.pk,
            'image_url': f'http://testserver/media/{image.image_file.name}',
            'is_main': True,
            'is_uploaded': True,
        }])

    def test_admin_can_change_primary_and_keep_legacy_url(self):
        legacy = self.product.product_images.create(
            image_url='https://example.com/polo.jpg', is_main=True,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            self.upload_url, {'image_file': self.image_file(), 'is_main': 'true'}, format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data[0], {
            'id': legacy.pk, 'image_url': legacy.image_url, 'is_main': False, 'is_uploaded': False,
        })
        self.assertTrue(response.data[1]['is_main'])

        primary_url = reverse('product-set-primary-image', args=[self.product.pk, legacy.pk])
        response = self.client.patch(primary_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['is_main'] for item in response.data], [True, False])

    def test_customer_cannot_manage_images(self):
        image = self.product.product_images.create(image_file=self.image_file())
        self.client.force_authenticate(self.customer)

        response = self.client.post(self.upload_url, {'image_file': self.image_file()}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(reverse('product-set-primary-image', args=[self.product.pk, image.pk]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(reverse('product-delete-image', args=[self.product.pk, image.pk]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_deletes_uploaded_primary_and_promotes_remaining_image(self):
        legacy = self.product.product_images.create(image_url='https://example.com/polo.jpg')
        image = self.product.product_images.create(image_file=self.image_file(), is_main=True)
        file_path = self.media_dir / image.image_file.name
        self.client.force_authenticate(self.employee)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(reverse('product-delete-image', args=[self.product.pk, image.pk]))
            self.assertTrue(file_path.is_file())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [{
            'id': legacy.pk, 'image_url': legacy.image_url, 'is_main': True, 'is_uploaded': False,
        }])
        self.assertFalse(file_path.exists())
        self.assertFalse(self.product.product_images.filter(pk=image.pk).exists())

    def test_admin_can_delete_secondary_image_and_then_last_image(self):
        primary = self.product.product_images.create(image_file=self.image_file(), is_main=True)
        secondary = self.product.product_images.create(image_file=self.image_file())
        self.client.force_authenticate(self.admin)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(reverse('product-delete-image', args=[self.product.pk, secondary.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([(item['id'], item['is_main']) for item in response.data], [(primary.pk, True)])

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(reverse('product-delete-image', args=[self.product.pk, primary.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
        self.assertFalse(list(self.media_dir.rglob('*.png')))

    def test_admin_cannot_delete_legacy_or_other_product_image(self):
        legacy = self.product.product_images.create(image_url='https://example.com/polo.jpg')
        other_image = self.other_product.product_images.create(image_file=self.image_file())
        self.client.force_authenticate(self.admin)

        for image in (legacy, other_image):
            with self.subTest(image_id=image.pk):
                response = self.client.delete(reverse('product-delete-image', args=[self.product.pk, image.pk]))
                self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
                self.assertTrue(ProductImage.objects.filter(pk=image.pk).exists())

    def test_primary_image_must_belong_to_product(self):
        image = self.other_product.product_images.create(image_url='https://example.com/camisa.jpg')
        self.client.force_authenticate(self.admin)

        response = self.client.patch(reverse('product-set-primary-image', args=[self.product.pk, image.pk]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_rejects_invalid_unsupported_and_oversized_files(self):
        self.client.force_authenticate(self.admin)
        files = (
            SimpleUploadedFile('invalid.png', b'not an image'),
            self.image_file('GIF'),
            SimpleUploadedFile('oversized.png', b'x' * (5 * 1024 * 1024 + 1)),
        )
        for image_file in files:
            with self.subTest(image_file=image_file.name):
                response = self.client.post(self.upload_url, {'image_file': image_file}, format='multipart')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn('image_file', response.data)

        self.assertFalse(self.product.product_images.exists())
        self.assertFalse(list(self.media_dir.rglob('*')))

    def test_failed_database_write_removes_uploaded_file_and_preserves_primary(self):
        legacy = self.product.product_images.create(
            image_url='https://example.com/polo.jpg', is_main=True,
        )
        self.client.force_authenticate(self.admin)
        with patch.object(ProductImage, 'save', side_effect=IntegrityError):
            with self.assertRaises(IntegrityError):
                self.client.post(
                    self.upload_url, {'image_file': self.image_file(), 'is_main': 'true'}, format='multipart',
                )

        legacy.refresh_from_db()
        self.assertTrue(legacy.is_main)
        self.assertFalse(list(self.media_dir.rglob('*.png')))

    def test_deleting_product_removes_image_file_on_commit(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(self.upload_url, {'image_file': self.image_file()}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        file_path = self.media_dir / self.product.product_images.get().image_file.name

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(reverse('product-detail', args=[self.product.pk]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(file_path.exists())
