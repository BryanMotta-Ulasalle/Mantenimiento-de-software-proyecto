from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.orders.models import Order, OrderItem
from .models import Category, Favorite, Product, ProductReview
from .serializers import (
    CategorySerializer,
    FavoriteSerializer,
    ProductReviewSerializer,
    ProductSerializer,
)
from apps.users.permissions import IsAdminOrEmployee, IsCustomer
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


class FavoriteViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsCustomer]
    serializer_class = FavoriteSerializer
    queryset = Favorite.objects.select_related(
        'user',
        'product__category',
    ).prefetch_related('product__product_images').order_by('-created_at', '-id')

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            product=serializer.validated_data['product'],
        )
        response_serializer = self.get_serializer(favorite)
        response_status = (
            status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
        return Response(response_serializer.data, status=response_status)


class ProductReviewViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ProductReviewSerializer
    queryset = ProductReview.objects.select_related('user', 'product')

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return [IsCustomer()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            product_id = self.request.query_params.get('product')
            if not product_id:
                raise ValidationError({'product': 'Este parámetro es obligatorio.'})
            try:
                product_id = int(product_id)
            except ValueError as error:
                raise ValidationError(
                    {'product': 'Debe ser un identificador numérico válido.'}
                ) from error

            if not Product.objects.filter(id=product_id, status=True).exists():
                raise NotFound('No se encontró el producto solicitado.')
            return queryset.filter(product_id=product_id)

        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        has_completed_purchase = OrderItem.objects.filter(
            product=product,
            order__user=self.request.user,
            order__status=Order.Status.COMPLETED,
        ).exists()
        if not has_completed_purchase:
            raise ValidationError(
                {'product_id': 'Solo puedes reseñar productos de pedidos completados.'}
            )
        serializer.save(user=self.request.user)
 
