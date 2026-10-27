from django.db import models
import uuid

# Create your models here.
class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reference = models.CharField(max_length=100, unique=True)
    access_code = models.CharField(max_length=100, blank=True)
    authorization_url = models.URLField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)