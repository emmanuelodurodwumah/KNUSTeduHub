from rest_framework import serializers
from Products.models import Category
from .product import ProductListSerializer

class CategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'category_slug', 'description', 'img']

class CategoryDetailSerializer(serializers.ModelSerializer):
    """
    Shows election details with contests
    """
    products = ProductListSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "img",
            "products"
        ]

