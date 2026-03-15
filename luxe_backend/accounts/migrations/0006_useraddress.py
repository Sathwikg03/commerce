from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        # depends on whatever your latest migration is — adjust if needed
        ('accounts', '0005_user_phone_address'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserAddress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(choices=[('Home', 'Home'), ('Work', 'Work'), ('Other', 'Other')], default='Home', max_length=20)),
                ('full_name', models.CharField(max_length=150)),
                ('phone', models.CharField(max_length=20)),
                ('line1', models.CharField(max_length=255)),
                ('line2', models.CharField(blank=True, default='', max_length=255)),
                ('city', models.CharField(max_length=100)),
                ('state', models.CharField(max_length=100)),
                ('pincode', models.CharField(max_length=10)),
                ('is_default', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='addresses',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-is_default', '-created_at']},
        ),
    ]