from django.db import models
from django.utils import timezone
from uuid import uuid4

class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'categories'

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column='category_id', related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    status = models.BooleanField(default=True)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    offer_starts_at = models.DateTimeField(null=True, blank=True)
    offer_ends_at = models.DateTimeField(null=True, blank=True)
    offer_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def offer_is_active(self, at=None):
        at = at or timezone.now()
        return bool(
            self.status and self.stock > 0 and self.offer_enabled
            and self.offer_price is not None and 0 < self.offer_price < self.price
            and self.offer_starts_at and self.offer_ends_at
            and self.offer_starts_at <= at < self.offer_ends_at
        )

    def selling_price(self, at=None):
        return self.offer_price if self.offer_is_active(at) else self.price
    
    class Meta:
        db_table = 'products'

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column='product_id', related_name='product_images')
    image_url = models.URLField(blank=True)
    image_file = models.ImageField(upload_to='products/', max_length=255, blank=True)
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.product.name}"
    
    class Meta:
        db_table = 'product_images'


class ProductImport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    rows = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    product_ids = models.JSONField(default=list)


class Favorite(models.Model):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='favorites',
        db_column='user_id',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        db_column='product_id',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.email} - {self.product.name}'

    class Meta:
        db_table = 'favorites'
        constraints = [
            models.UniqueConstraint(
                fields=('user', 'product'),
                name='unique_user_favorite_product',
            ),
        ]


class ProductReview(models.Model):
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='product_reviews',
        db_column='user_id',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        db_column='product_id',
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.product.name} - {self.rating}/5 ({self.user.email})'

    class Meta:
        db_table = 'product_reviews'
        ordering = ('-created_at', '-id')
        constraints = [
            models.UniqueConstraint(
                fields=('user', 'product'),
                name='unique_user_product_review',
            ),
            models.CheckConstraint(
                condition=models.Q(rating__gte=1, rating__lte=5),
                name='product_review_rating_between_1_and_5',
            ),
        ]
