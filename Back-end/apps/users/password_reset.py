from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils.http import urlsafe_base64_decode
from drf_spectacular.utils import extend_schema
from rest_framework import generics, serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import User


INVALID_LINK = 'El enlace de recuperación no es válido o ha caducado.'


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(max_length=64)
    token = serializers.CharField(max_length=128, write_only=True)
    new_password = serializers.CharField(max_length=128, trim_whitespace=False, write_only=True)


class PasswordResetResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()


class PasswordResetView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]


class PasswordResetRequestView(PasswordResetView):
    serializer_class = PasswordResetRequestSerializer
    throttle_scope = 'password_reset_request'

    @extend_schema(responses=PasswordResetResponseSerializer)
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        form = PasswordResetForm(serializer.validated_data)
        if form.is_valid():
            form.save(
                request=request,
                subject_template_name='users/password_reset_subject.txt',
                email_template_name='users/password_reset_email.txt',
                extra_email_context={'frontend_url': settings.FRONTEND_URL},
            )

        return Response({'detail': 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'})


class PasswordResetConfirmView(PasswordResetView):
    serializer_class = PasswordResetConfirmSerializer
    throttle_scope = 'password_reset_confirm'

    @extend_schema(responses=PasswordResetResponseSerializer)
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            user_id = int(urlsafe_base64_decode(data['uid']))
        except ValueError as error:
            raise serializers.ValidationError({'detail': INVALID_LINK}) from error

        with transaction.atomic():
            user = User.objects.select_for_update().filter(pk=user_id, is_active=True).first()
            if not user or not default_token_generator.check_token(user, data['token']):
                raise serializers.ValidationError({'detail': INVALID_LINK})

            password = data['new_password']
            try:
                validate_password(password, user=user)
            except DjangoValidationError as error:
                raise serializers.ValidationError({'new_password': error.messages}) from error

            user.set_password(password)
            user.save(update_fields=['password'])

        return Response({'detail': 'Tu contraseña se actualizó. Ya puedes iniciar sesión.'})
