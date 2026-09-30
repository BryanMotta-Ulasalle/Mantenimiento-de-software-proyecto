from decimal import Decimal

from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.products.models import Category, Product
from apps.users.models import User
from apps.users.permissions import IsAdmin

from .constants import LOW_STOCK_THRESHOLD, MONTH_LABELS


class DashboardSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        order_amount = Order.objects.aggregate(total=Sum('total_price'))['total']
        orders_by_month = (
            Order.objects
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Sum('total_price'))
            .order_by('month')
        )
        products_by_category = (
            Category.objects
            .annotate(count=Count('products'))
            .values('name', 'count')
            .order_by('name')
        )
        recent_orders = Order.objects.select_related('user').order_by(
            '-created_at',
            '-id',
        )[:5]
        low_stock_products = Product.objects.select_related('category').filter(
            stock__lte=LOW_STOCK_THRESHOLD,
        ).order_by('stock', 'name')

        return Response({
            'summary': {
                'products': Product.objects.count(),
                'categories': Category.objects.count(),
                'users': User.objects.count(),
                'orders': Order.objects.count(),
                'order_amount': str(order_amount or Decimal('0.00')),
                'low_stock_products': low_stock_products.count(),
                'low_stock_threshold': LOW_STOCK_THRESHOLD,
            },
            'orders_by_month': [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'label': MONTH_LABELS[item['month'].month],
                    'total': str(item['total'] or Decimal('0.00')),
                }
                for item in orders_by_month
            ],
            'products_by_category': [
                {
                    'category': item['name'],
                    'count': item['count'],
                }
                for item in products_by_category
            ],
            'recent_orders': [
                {
                    'id': order.id,
                    'user_name': order.user.name,
                    'status': order.status,
                    'total_price': str(order.total_price),
                    'shipping_address': order.shipping_address,
                    'created_at': order.created_at.isoformat(),
                }
                for order in recent_orders
            ],
            'low_stock_items': [
                {
                    'product': product.name,
                    'category': product.category.name,
                    'stock': product.stock,
                }
                for product in low_stock_products
            ],
        })
