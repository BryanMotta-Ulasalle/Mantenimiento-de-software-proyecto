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
        fields = ('id','user', 'total_price', 'items', 'status', 'shipping_address')
        read_only_fields = ('total_price', 'status', 'user')
        
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