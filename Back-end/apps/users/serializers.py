from rest_framework import serializers
from .models import User, Role
from rest_framework.validators import UniqueValidator

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('id', 'name')

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='role',
        write_only=True
    )

    password = serializers.CharField(
    write_only=True,
    required=False,
    min_length=8
)
    
    
    class Meta:
        model = User
        fields = (
            'id',
            'name',
            'email',
            'is_active',
            'created_at',
            'updated_at',
            'role',
            'role_id',
            'password',
        )

        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
        )
        
    
    def update(self, instance, validated_data):

        password = validated_data.pop(
            'password',
            None
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance


class MeUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = (
            'id',
            'name',
            'email',
            'is_active',
            'created_at',
            'updated_at',
            'role',
        )
        read_only_fields = (
            'id',
            'is_active',
            'created_at',
            'updated_at',
            'role',
        )

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError('El email ya esta registrado')
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8
    )
    
    email = serializers.EmailField(
    validators=[
        UniqueValidator(
            queryset=User.objects.all(),
            message='El email ya está registrado'
        )
    ]
)

    class Meta:
        model = User
        fields = (
            'id',
            'name',
            'email',
            'password',
        )
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        try:
            customer_role = Role.objects.get(name='Customer')
        except Role.DoesNotExist:
            raise serializers.ValidationError(
                {'role': 'El rol Customer no esta configurado.'}
            )

        return User.objects.create_user(
            password=password,
            role=customer_role,
            **validated_data,
        )
