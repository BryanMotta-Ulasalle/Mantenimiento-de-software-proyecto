from functools import partial

from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import ProductImage


@receiver(post_delete, sender=ProductImage)
def delete_product_image_file(sender, instance, using, **kwargs):
    image_file = instance.image_file
    if image_file:
        transaction.on_commit(
            partial(image_file.storage.delete, image_file.name),
            using=using,
            robust=True,
        )
