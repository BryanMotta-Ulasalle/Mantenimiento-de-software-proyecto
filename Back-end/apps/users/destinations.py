import re

from django.db import transaction
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import ShippingDestination, User


def normalize_phone(value):
    phone = re.sub(r'[\s().-]', '', value.strip())
    if not re.fullmatch(r'\+?[0-9]{9,15}', phone):
        raise serializers.ValidationError('Ingresa un teléfono de 9 a 15 dígitos, con prefijo + opcional.')
    return phone


class DestinationSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(max_length=40)
    address = serializers.CharField(min_length=5, max_length=255)

    def validate_phone(self, value):
        return normalize_phone(value)

    class Meta:
        model = ShippingDestination
        fields = ('id', 'label', 'address', 'phone', 'is_default')


class DestinationViewSet(viewsets.ModelViewSet):
    serializer_class = DestinationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShippingDestination.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        with transaction.atomic():
            User.objects.select_for_update().get(pk=self.request.user.pk)
            destinations = self.get_queryset()
            preferred = serializer.validated_data.get('is_default', False) or not destinations.exists()
            if preferred:
                destinations.update(is_default=False)
            serializer.save(user=self.request.user, is_default=preferred)

    def perform_update(self, serializer):
        with transaction.atomic():
            User.objects.select_for_update().get(pk=self.request.user.pk)
            destination = self.get_queryset().get(pk=serializer.instance.pk)
            serializer.instance = destination
            preferred = serializer.validated_data.get('is_default', destination.is_default)
            if destination.is_default and not preferred:
                raise ValidationError('Selecciona otra dirección como preferente antes de cambiar esta.')
            if preferred:
                self.get_queryset().exclude(pk=destination.pk).update(is_default=False)
            serializer.save()

    def perform_destroy(self, instance):
        with transaction.atomic():
            User.objects.select_for_update().get(pk=self.request.user.pk)
            destination = self.get_queryset().get(pk=instance.pk)
            if self.get_queryset().count() == 1:
                raise ValidationError('Debes conservar al menos una dirección de envío.')
            preferred = destination.is_default
            destination.delete()
            if preferred:
                replacement = self.get_queryset().first()
                replacement.is_default = True
                replacement.save(update_fields=['is_default'])
