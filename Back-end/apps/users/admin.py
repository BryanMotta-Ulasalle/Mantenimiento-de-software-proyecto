from django.contrib import admin
from .models import User, Role


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
	list_display = ('id', 'email', 'name', 'is_staff', 'is_active')
	search_fields = ('email', 'name')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
	list_display = ('id', 'name')
