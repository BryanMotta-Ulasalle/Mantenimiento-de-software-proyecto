from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    FavoriteViewSet,
    ProductReviewViewSet,
    ProductViewSet,
)


router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'reviews', ProductReviewViewSet, basename='product-review')


urlpatterns = [
    path('', include(router.urls)),
]
