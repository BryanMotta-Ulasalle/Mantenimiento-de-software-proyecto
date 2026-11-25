import csv
from decimal import Decimal
from pathlib import Path

source = Path(r'C:\Users\Usuario\Downloads\Productos de Ecommerce - Mercavia - Productos.csv')
target = Path(__file__).resolve().parents[1] / 'productos_mercavia_corregido.csv'
with source.open(encoding='utf-8-sig', newline='') as handle:
    reader = csv.DictReader(handle)
    headers = reader.fieldnames
    rows = list(reader)
assert headers == ['nombre', 'descripcion', 'categoria', 'precio', 'stock', 'activo']
assert len(rows) == 20
for row in rows:
    raw = row['precio'].strip()
    assert raw.startswith('S/ '), raw
    price = Decimal(raw.removeprefix('S/ ').replace(',', '.'))
    assert price.is_finite() and price > 0
    row['precio'] = format(price, '.2f')
with target.open('w', encoding='utf-8-sig', newline='') as handle:
    writer = csv.DictWriter(handle, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)
print(f'Archivo corregido: {len(rows)} productos. Solo se modificó precio.')

# Validar con el importador del proyecto, usando una base temporal en memoria.
import os
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[3] / 'Back-end'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ECommerce.settings')
from django.conf import settings
settings.DATABASES['default'] = {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}
import django
django.setup()
from django.core.management import call_command
call_command('migrate', verbosity=0, interactive=False)
from apps.users.models import Role, User
from apps.products.models import Category
from apps.products.imports import ProductImportViewSet
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory, force_authenticate
for name in sorted({row['categoria'] for row in rows}):
    Category.objects.create(name=name)
user = User.objects.create_user(email='csvcheck@example.test', name='Check', role=Role.objects.get(name='Admin'))
request = APIRequestFactory().post('/preview/', {'file': SimpleUploadedFile(target.name, target.read_bytes(), content_type='text/csv')}, format='multipart')
force_authenticate(request, user)
response = ProductImportViewSet.as_view({'post': 'preview'})(request)
assert response.status_code == 200, response.data
assert response.data['valid_count'] == 20 and response.data['batch_id'], response.data
print('Importador: 20 de 20 filas válidas con las categorías correspondientes en una base temporal.')
