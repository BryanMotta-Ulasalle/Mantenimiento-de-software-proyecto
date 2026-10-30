from rest_framework import serializers

from .models import Category, Favorite, Product, ProductImage, ProductReview


class CategorySerializer(serializers.ModelSerializer):
    total_products = serializers.IntegerField(read_only=True)
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'total_products')
        
class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = ('id', 'image_url', 'is_main')        


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
        
