from django.db import migrations


class Migration(migrations.Migration):
    """
    This migration was a duplicate — is_email_verified was already added
    in 0003_user_reset_otp. Keeping it as a no-op so the migration chain
    stays intact without breaking existing deployments.
    """

    dependencies = [
        ('accounts', '0003_user_reset_otp'),
    ]

    operations = [
        # intentionally empty — field was already created in 0003
    ]
