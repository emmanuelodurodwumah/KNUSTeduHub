import uuid

from django.db import models
from django.utils.text import slugify


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category_slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    img = models.ImageField(upload_to='category_images/', blank=True, null=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.category_slug:
            self.category_slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    product_slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    img = models.ImageField(upload_to='product_images/', blank=True, null=True)
    stock_quantity = models.PositiveIntegerField()
    category_id = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Products"

    def save(self, *args, **kwargs):
        if not self.product_slug:
            self.product_slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
