from uuid import uuid4
from django.utils import timezone

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import Category, Favorite, Product, ProductImage, ProductReview


class CategorySerializer(serializers.ModelSerializer):
    total_products = serializers.IntegerField(read_only=True)
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'total_products')
        
class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    is_uploaded = serializers.SerializerMethodField()

    @extend_schema_field(OpenApiTypes.URI)
    def get_image_url(self, image):
        if not image.image_file:
            return image.image_url

        url = image.image_file.url
        request = self.context.get('request')
        return request.build_absolute_uri(url) if request else url

    def get_is_uploaded(self, image) -> bool:
        return bool(image.image_file)

    class Meta:
        model = ProductImage
        fields = ('id', 'image_url', 'is_main', 'is_uploaded')


@extend_schema_field(OpenApiTypes.BINARY)
class ProductImageFileField(serializers.ImageField):
    MAX_SIZE = 5 * 1024 * 1024
    EXTENSIONS = {'JPEG': 'jpg', 'PNG': 'png', 'WEBP': 'webp'}

    def to_internal_value(self, data):
        if getattr(data, 'size', 0) > self.MAX_SIZE:
            raise serializers.ValidationError('La imagen debe pesar como máximo 5 MB.')

        image = super().to_internal_value(data)
        extension = self.EXTENSIONS.get(image.image.format)
        if not extension:
            raise serializers.ValidationError('Usa una imagen JPG, PNG o WebP.')

        image.name = f'{uuid4().hex}.{extension}'
        return image


class ProductImageUploadSerializer(serializers.Serializer):
    image_file = ProductImageFileField(error_messages={
        'invalid_image': 'El archivo no es una imagen válida.',
    })
    is_main = serializers.BooleanField(default=False)


class ProductSerializer(serializers.ModelSerializer):
    effective_price = serializers.SerializerMethodField()
    is_on_offer = serializers.SerializerMethodField()

    def get_effective_price(self, product) -> str:
        return str(product.selling_price(self.context.setdefault('pricing_time', timezone.now())))

    def get_is_on_offer(self, product) -> bool:
        return product.offer_is_active(self.context.setdefault('pricing_time', timezone.now()))

    def validate(self, attrs):
        request = self.context.get('request')
        offer_fields = {'offer_price', 'offer_starts_at', 'offer_ends_at', 'offer_enabled'}
        if request and offer_fields.intersection(attrs) and getattr(getattr(request.user, 'role', None), 'name', None) != 'Admin':
            raise serializers.ValidationError('Solo Admin puede gestionar ofertas.')

        def value(field):
            return attrs.get(field, getattr(self.instance, field, None))

        offer_price = value('offer_price')
        starts = value('offer_starts_at')
        ends = value('offer_ends_at')
        if offer_price is not None and not 0 < offer_price < value('price'):
            raise serializers.ValidationError({'offer_price': 'El precio de oferta debe ser positivo y menor que el precio normal.'})
        if starts and ends and starts >= ends:
            raise serializers.ValidationError({'offer_ends_at': 'El fin debe ser posterior al inicio.'})
        if value('offer_enabled') and (offer_price is None or not starts or not ends):
            raise serializers.ValidationError({'offer_enabled': 'Indica el precio y las fechas de la oferta.'})
        return attrs

    category = CategorySerializer(read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    product_images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'category_id',
            'name',
            'description',
            'price',
            'offer_price',
            'offer_starts_at',
            'offer_ends_at',
            'offer_enabled',
            'effective_price',
            'is_on_offer',
            'stock',
            'status',
            'product_images',
            'created_at',
            'updated_at',
        )

        read_only_fields = (
            'created_at',
            'updated_at',
        )


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True,
    )

    def validate_product_id(self, product):
        if not product.status:
            raise serializers.ValidationError(
                'No se pueden agregar productos que no están disponibles.',
            )
        return product

    class Meta:
        model = Favorite
        fields = ('id', 'product', 'product_id', 'created_at')
        read_only_fields = ('id', 'created_at')


class ProductReviewSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status=True),
        source='product',
        write_only=True,
        required=True,
    )
    user_name = serializers.CharField(source='user.name', read_only=True)
    is_mine = serializers.SerializerMethodField()
    comment = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def get_is_mine(self, review):
        request = self.context.get('request')
        return bool(
            request
            and request.user.is_authenticated
            and review.user_id == request.user.id
        )

    class Meta:
        model = ProductReview
        fields = (
            'id',
            'product_id',
            'user_name',
            'is_mine',
            'rating',
            'comment',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'user_name', 'is_mine', 'created_at', 'updated_at')

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('La puntuación debe estar entre 1 y 5.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        product = attrs.get('product')
        if self.instance is not None and product is not None:
            raise serializers.ValidationError(
                {'product_id': 'No se puede cambiar el producto de una reseña existente.'}
            )
        if (
            self.instance is None
            and request
            and request.user.is_authenticated
            and product
            and ProductReview.objects.filter(
                user=request.user,
                product=product,
            ).exists()
        ):
            raise serializers.ValidationError(
                {'product_id': 'Ya tienes una reseña para este producto.'}
            )
        return attrs
        
