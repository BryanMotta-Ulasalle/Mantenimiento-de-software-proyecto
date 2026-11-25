import csv
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from io import StringIO
import unicodedata

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from apps.users.permissions import IsAdminOrEmployee
from .models import Category, Product, ProductImport
from .serializers import ProductSerializer


def clean_text(value):
    return ' '.join(unicodedata.normalize('NFKC', value or '').split())


def product_key(name, category_id):
    return (clean_text(name).casefold(), category_id)


class ImportFileSerializer(serializers.Serializer):
    file = serializers.FileField()


class ImportConfirmSerializer(serializers.Serializer):
    batch_id = serializers.UUIDField()


class ProductImportViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAdminOrEmployee]
    serializer_class = ImportFileSerializer
    MAX_ROWS = 1000
    MAX_BYTES = 2 * 1024 * 1024

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def preview(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        upload = serializer.validated_data['file']
        if upload.size > self.MAX_BYTES:
            raise ValidationError('El CSV debe pesar como máximo 2 MB.')
        try:
            text = upload.read().decode('utf-8-sig')
        except UnicodeDecodeError as error:
            raise ValidationError('Guarda el CSV en UTF-8.') from error
        if not text.strip() or '\x00' in text:
            raise ValidationError('El archivo está vacío o contiene datos inválidos.')
        try:
            delimiter = ';' if text.splitlines()[0].count(';') > text.splitlines()[0].count(',') else ','
            reader = csv.reader(StringIO(text), delimiter=delimiter, strict=True)
            headers = [clean_text(field).casefold() for field in next(reader)]
            required = {'nombre', 'descripcion', 'categoria', 'precio', 'stock'}
            if len(set(headers)) != len(headers) or not required.issubset(headers) or set(headers) - required - {'activo'}:
                raise ValidationError('Usa las columnas nombre, descripcion, categoria, precio, stock y activo (opcional), sin duplicados.')
            raw_rows = []
            for row in reader:
                if not any(field.strip() for field in row):
                    continue
                if len(raw_rows) >= self.MAX_ROWS:
                    raise ValidationError('El límite es de 1000 productos por importación.')
                raw_rows.append((reader.line_num, row))
        except (csv.Error, StopIteration) as error:
            raise ValidationError('El CSV está mal formado. Revisa las comillas y los separadores.') from error
        if not raw_rows:
            raise ValidationError('El CSV debe contener al menos un producto.')

        categories = {}
        for category in Category.objects.all():
            categories.setdefault(clean_text(category.name).casefold(), []).append(category.pk)
        existing = {product_key(name, category_id) for name, category_id in Product.objects.values_list('name', 'category_id')}
        seen = set()
        results = []
        valid_rows = []
        for line, row in raw_rows:
            if len(row) != len(headers):
                results.append({'line': line, 'errors': ['La cantidad de columnas no coincide con la cabecera.']})
                continue
            data = dict(zip(headers, [clean_text(field) for field in row]))
            errors = []
            if any(data.get(field, '').casefold() in {'null', 'none', 'nan'} for field in required):
                errors.append('Reemplaza los valores nulos por datos válidos.')
            matches = categories.get(data['categoria'].casefold(), [])
            if len(matches) != 1:
                errors.append('La categoría debe existir y tener un nombre único.')
            try:
                price = Decimal(data['precio'].replace(',', '.'))
                if not price.is_finite() or price <= 0 or price != price.quantize(Decimal('0.01')):
                    raise InvalidOperation
            except InvalidOperation:
                errors.append('El precio debe ser positivo y tener como máximo dos decimales.')
                price = Decimal('0')
            if not data['stock'].isascii() or not data['stock'].isdigit():
                errors.append('El stock debe ser un entero mayor o igual a cero.')
            active = data.get('activo', 'true').casefold()
            if active not in {'true', 'false', '1', '0', 'si', 'sí', 'no'}:
                errors.append('Activo debe ser sí/no, true/false o 1/0.')
            payload = {
                'name': data['nombre'], 'description': data['descripcion'],
                'category_id': matches[0] if len(matches) == 1 else None,
                'price': format(price, '.2f'), 'stock': data['stock'], 'status': active in {'true', '1', 'si', 'sí'},
            }
            product_serializer = ProductSerializer(data=payload)
            if not product_serializer.is_valid():
                errors.append(dict(product_serializer.errors))
            key = product_key(payload['name'], payload['category_id'])
            if key in seen or key in existing:
                errors.append('El nombre y categoría se repiten en el CSV o ya existen en el catálogo.')
            seen.add(key)
            results.append({'line': line, 'product': payload, 'errors': errors, 'normalized': data})
            if not errors:
                valid_rows.append(payload)

        batch_id = None
        if len(valid_rows) == len(raw_rows):
            batch = ProductImport.objects.create(user=request.user, rows=valid_rows)
            batch_id = str(batch.pk)
        return Response({'batch_id': batch_id, 'rows': results, 'valid_count': len(valid_rows), 'total': len(raw_rows)})

    @action(detail=False, methods=['post'], serializer_class=ImportConfirmSerializer)
    def confirm(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            batch = get_object_or_404(
                ProductImport.objects.select_for_update(), pk=serializer.validated_data['batch_id'], user=request.user,
            )
            if batch.confirmed_at:
                return Response({'count': len(batch.product_ids), 'product_ids': batch.product_ids})
            if timezone.now() - batch.created_at > timedelta(hours=1):
                raise ValidationError('La revisión venció. Vuelve a cargar el CSV.')
            category_ids = {row['category_id'] for row in batch.rows}
            list(Category.objects.select_for_update().filter(pk__in=category_ids).order_by('id'))
            existing = {product_key(name, pk) for name, pk in Product.objects.filter(category_id__in=category_ids).values_list('name', 'category_id')}
            products = []
            for row in batch.rows:
                if product_key(row['name'], row['category_id']) in existing:
                    raise ValidationError('Un producto de este lote ya existe. Revisa el archivo otra vez.')
                item = ProductSerializer(data=row)
                item.is_valid(raise_exception=True)
                products.append(Product(**item.validated_data))
            Product.objects.bulk_create(products)
            batch.product_ids = [product.pk for product in products]
            batch.confirmed_at = timezone.now()
            batch.save(update_fields=['product_ids', 'confirmed_at'])
        return Response({'count': len(products), 'product_ids': batch.product_ids})
