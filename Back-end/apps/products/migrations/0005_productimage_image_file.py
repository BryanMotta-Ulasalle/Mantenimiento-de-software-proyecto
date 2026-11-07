from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('products', '0004_productreview')]

    operations = [
        migrations.AddField(
            model_name='productimage',
            name='image_file',
            field=models.ImageField(blank=True, max_length=255, upload_to='products/'),
        ),
        migrations.AlterField(
            model_name='productimage',
            name='image_url',
            field=models.URLField(blank=True),
        ),
    ]
