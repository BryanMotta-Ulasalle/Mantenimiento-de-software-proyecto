from rest_framework import mixins, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import OrderNotification


class NotificationSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OrderNotification
        fields = ('id', 'order_id', 'status', 'status_label', 'created_at', 'is_read')
        read_only_fields = fields


class NotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return OrderNotification.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        notifications = self.get_queryset()
        return Response({
            'unread_count': notifications.filter(is_read=False).count(),
            'results': self.get_serializer(notifications[:50], many=True).data,
        })

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        self.get_queryset().filter(pk=notification.pk).update(is_read=True)
        return Response({'is_read': True})

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'unread_count': 0})
