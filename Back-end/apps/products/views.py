from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from apps.users.permissions import IsAdminOrEmployee
from django.db.models import Count


ALLOWED_ORDERING = {
    'name',
    '-name',
    'price',
    '-price',
    'stock',
    '-stock',
    'created_at',
    '-created_at',
}


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(
        total_products=Count('products')
        ).order_by('id')
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminOrEmployee()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').prefetch_related('product_images').order_by('id')
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        search = params.get('search', '').strip()
        if search:
            queryset = queryset.filter(name__icontains=search)

        category = params.get('category')
        if category:
            try:
                queryset = queryset.filter(category_id=int(category))
            except ValueError as error:
                raise ValidationError({
                    'category': 'Debe ser un identificador numérico válido.'
                }) from error

        is_active = params.get('is_active')
        if is_active:
            normalized_status = is_active.lower()
            if normalized_status not in {'true', 'false'}:
                raise ValidationError({
                    'is_active': 'Use true o false.'
                })
            queryset = queryset.filter(status=normalized_status == 'true')

        stock = params.get('stock')
        if stock == 'available':
            queryset = queryset.filter(stock__gt=0)
        elif stock == 'out':
            queryset = queryset.filter(stock=0)
        elif stock:
            raise ValidationError({
                'stock': 'Use available o out.'
            })

        ordering = params.get('ordering')
        if ordering:
            if ordering not in ALLOWED_ORDERING:
                raise ValidationError({
                    'ordering': 'Criterio de ordenamiento no válido.'
                })
            queryset = queryset.order_by(ordering)

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminOrEmployee()]
 
