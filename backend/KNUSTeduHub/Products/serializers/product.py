from rest_framework import serializers
from Products.models import Category, Product

class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category_id.name", read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    
    class Meta:
        model = Product
        fields = ['id', 'product_slug', 'name', 'img', 'description', 'price', 'stock_quantity', 'category', 'category_id']
