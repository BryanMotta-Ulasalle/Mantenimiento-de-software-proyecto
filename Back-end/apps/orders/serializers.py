from rest_framework import serializers
from decimal import Decimal

from apps.products.models import Product

from .models import Order, OrderItem, Payment, Cart, CartItem
from apps.products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'unit_price')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'user',
            'total_price',
            'items',
            'status',
            'shipping_address',
            'created_at',
        )
        read_only_fields = ('total_price', 'status', 'user', 'created_at')


class OrderStatusSerializer(serializers.ModelSerializer):
    ALLOWED_TRANSITIONS = {
        Order.Status.PENDING: {
            Order.Status.PROCESSING,
            Order.Status.CANCELLED,
        },
        Order.Status.PROCESSING: {
            Order.Status.COMPLETED,
            Order.Status.CANCELLED,
        },
        Order.Status.COMPLETED: set(),
        Order.Status.CANCELLED: set(),
    }

    def validate_status(self, value):
        current_status = self.instance.status
        if value == current_status:
            return value

        allowed_statuses = self.ALLOWED_TRANSITIONS.get(current_status, set())
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f'No se puede cambiar de {current_status} a {value}.',
            )

        return value

    class Meta:
        model = Order
        fields = ('status',)
        
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'payment_method', 'payment_status', 'transaction_id', 'amount')
        read_only_fields = ('payment_status', 'transaction_id', 'amount')
        
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    quantity = serializers.IntegerField(
        min_value=1,
        error_messages={
            'min_value': 'La cantidad debe ser mayor o igual a 1.',
        },
    )

    def validate(self, attrs):
        product = attrs.get('product')
        if product is None and self.instance is not None:
            product = self.instance.product

        quantity = attrs.get('quantity')
        if quantity is None and self.instance is not None:
            quantity = self.instance.quantity

        errors = {}
        if product is not None and not product.status:
            errors['product_id'] = 'El producto no está disponible.'
        if product is not None and quantity is not None and quantity > product.stock:
            errors['quantity'] = (
                'La cantidad solicitada supera el stock disponible.'
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity')

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    def get_total_price(self, obj):
        total = Decimal('0.00')
        for item in obj.items.select_related('product').all():
            product_price = item.product.price or Decimal('0.00')
            total += Decimal(item.quantity) * product_price
        return total

    class Meta:
        model = Cart
        fields = ('id', 'user', 'items', 'total_price')
        read_only_fields = ('user',)
