from django.contrib import admin
from .models import Category, Product


# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "description",
        "category_slug"
    )

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "description",
        "price",
        "stock_quantity",
        "category_id",
    )
