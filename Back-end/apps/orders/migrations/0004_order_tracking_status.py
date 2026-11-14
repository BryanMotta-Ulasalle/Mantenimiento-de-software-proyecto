from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0003_alter_order_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pedido recibido'),
                    ('processing', 'En preparación'),
                    ('shipped', 'En camino'),
                    ('completed', 'Entregado'),
                    ('cancelled', 'Cancelado'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
