from django.db import OperationalError, ProgrammingError, transaction

DEFAULT_ROLES = (
    (1, "Admin"),
    (2, "Employee"),
    (3, "Customer"),
)


def ensure_default_roles():
    from .models import Role

    try:
        with transaction.atomic():
            for role_id, role_name in DEFAULT_ROLES:
                role = Role.objects.filter(id=role_id).first()

                if role:
                    if role.name != role_name:
                        role.name = role_name
                        role.save(update_fields=["name"])
                    continue

                if Role.objects.filter(name=role_name).exists():
                    continue

                Role.objects.create(id=role_id, name=role_name)
    except (OperationalError, ProgrammingError):
        # The table may not exist yet during early app startup.
        return
