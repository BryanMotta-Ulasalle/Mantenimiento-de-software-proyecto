from django.db import models

class Order(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='orders', db_column='user_id')
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.CharField(max_length=255)

    def __str__(self):
        return f'Order #{self.id} by {self.user.email}'
    
    class Meta:
        db_table = 'orders'
        
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', db_column='order_id')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='order_items', db_column='product_id')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity} x {self.product.name} for Order #{self.order.id}'
    
    class Meta:
        db_table = 'order_items'
        
class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment', db_column='order_id')
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Payment for Order #{self.order.id} - {self.payment_status}'
    
    class Meta:
        db_table = 'payments'
        
class Cart(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='cart', db_column='user_id')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Cart for {self.user.email}'
    
    class Meta:
        db_table = 'carts'
        
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', db_column='cart_id')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='cart_items', db_column='product_id')
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.quantity} x {self.product.name} in Cart for {self.cart.user.email}'
    
    class Meta:
        db_table = 'cart_items'
