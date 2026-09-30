from decimal import Decimal

from django.db import transaction
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from apps.products.models import Product
from .models import Order, OrderItem, Cart, CartItem
from .serializers import OrderSerializer, OrderItemSerializer, CartSerializer, CartItemSerializer


def _is_admin_user(user):
    return bool(getattr(user, 'is_authenticated', False) and getattr(getattr(user, 'role', None), 'name', None) == 'Admin')


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.select_related('user').prefetch_related('items').order_by('id')
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if _is_admin_user(self.request.user):
            return queryset
        return queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        user = self.request.user

        with transaction.atomic():
            cart = Cart.objects.select_for_update().filter(user=user).first()
            if cart is None:
                raise ValidationError('Cart is empty or does not exist')

            cart_items = list(cart.items.all())
            if not cart_items:
                raise ValidationError('Cart is empty or does not exist')

            requested_quantities = {}
            for cart_item in cart_items:
                requested_quantities[cart_item.product_id] = (
                    requested_quantities.get(cart_item.product_id, 0)
                    + cart_item.quantity
                )

            products = {
                product.id: product
                for product in Product.objects.select_for_update().filter(
                    id__in=requested_quantities
                )
            }

            stock_errors = []
            product_errors = []
            for product_id, requested_quantity in requested_quantities.items():
                product = products.get(product_id)
                if product is None:
                    stock_errors.append(
                        f'El producto {product_id} ya no esta disponible.'
                    )
                elif not product.status:
                    product_errors.append(
                        f'El producto {product.name} ya no esta disponible.'
                    )
                elif product.stock < requested_quantity:
                    stock_errors.append(
                        f'Stock insuficiente para {product.name}: '
                        f'disponible {product.stock}, solicitado {requested_quantity}.'
                    )

            if stock_errors or product_errors:
                errors = {}
                if stock_errors:
                    errors['stock'] = stock_errors
                if product_errors:
                    errors['product'] = product_errors
                raise ValidationError(errors)

            total = sum(
                (
                    Decimal(cart_item.quantity)
                    * (products[cart_item.product_id].price or Decimal('0.00'))
                    for cart_item in cart_items
                ),
                Decimal('0.00'),
            )

            order = serializer.save(user=user, total_price=total)

            order_items = [
                OrderItem(
                    order=order,
                    product=products[cart_item.product_id],
                    quantity=cart_item.quantity,
                    unit_price=products[cart_item.product_id].price,
                )
                for cart_item in cart_items
            ]
            OrderItem.objects.bulk_create(order_items)

            for product_id, requested_quantity in requested_quantities.items():
                products[product_id].stock -= requested_quantity
            Product.objects.bulk_update(products.values(), ['stock'])

            cart.items.all().delete()


class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = OrderItem.objects.select_related('order', 'product').order_by('id')
    serializer_class = OrderItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if _is_admin_user(self.request.user):
            return queryset
        return queryset.filter(order__user=self.request.user)
    
class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Cart.objects.select_related('user').prefetch_related('items__product').order_by('id')
    serializer_class = CartSerializer    

    def get_queryset(self):
        queryset = super().get_queryset()
        if _is_admin_user(self.request.user):
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.select_related('cart__user', 'product').order_by('id')
    serializer_class = CartItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if _is_admin_user(self.request.user):
            return queryset
        return queryset.filter(cart__user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        cart = getattr(user, 'cart', None)
        if cart is None:
            cart = Cart.objects.create(user=user)
        serializer.save(cart=cart)

    def perform_update(self, serializer):
        # Ensure the cart association is preserved and belongs to the user
        instance = serializer.instance
        user = self.request.user
        if instance.cart.user_id != user.id:
            raise ValidationError('Cannot modify items of another user\'s cart')
        serializer.save()

""" class PaymentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Payment.objects.select_related(
        'order'
    )
    serializer_class = PaymentSerializer """
