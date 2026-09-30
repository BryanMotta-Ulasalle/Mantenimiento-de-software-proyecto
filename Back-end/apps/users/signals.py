from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .bootstrap import ensure_default_roles


@receiver(post_migrate)
def create_default_roles(sender, **kwargs):
    if sender.name != "apps.users":
        return

    ensure_default_roles()
