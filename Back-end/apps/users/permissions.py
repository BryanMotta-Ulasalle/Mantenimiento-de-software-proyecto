from rest_framework.permissions import (
    BasePermission
)


class IsAdmin(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and request.user.role.name == 'Admin'
        )

class IsAdminOrEmployee(
    BasePermission
):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and request.user.role.name in [
                'Admin',
                'Employee'
            ]
        )

class IsCustomer(BasePermission):

    def has_permission(
        self,
        request,
        view
    ):

        return (
            request.user.is_authenticated
            and request.user.role.name == 'Customer'
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level permission to allow owners to edit their object or admins."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admins by role
        if getattr(user, 'role', None) and user.role.name == 'Admin':
            return True
        # Allow owners
        try:
            return getattr(obj, 'id', None) == user.id
        except Exception:
            return False