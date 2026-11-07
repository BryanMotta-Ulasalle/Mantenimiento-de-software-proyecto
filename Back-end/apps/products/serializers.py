from uuid import uuid4

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
        
