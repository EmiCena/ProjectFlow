# Generated manual - email verification
import django.db.models.deletion
from django.db import migrations, models
from django.utils import timezone

def set_existing_verified(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(is_email_verified=False).update(is_email_verified=True, email_verified_at=timezone.now())

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_email_verified',
            field=models.BooleanField(default=False, help_text='True si el usuario verificó su email'),
        ),
        migrations.AddField(
            model_name='user',
            name='email_verified_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(set_existing_verified, reverse_code=migrations.RunPython.noop),
    ]
