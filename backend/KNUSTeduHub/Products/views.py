
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny
from Products.models import Category, Product
from Products.permissions import IsStoreAdmin
from Products.serializers.category import CategoryListSerializer, CategoryDetailSerializer
from Products.serializers.product import ProductListSerializer
# from django_filters.rest_framework import DjangoFilterBackend
# import django_filters

# Create your views here.
class CategoryListViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    lookup_field = 'category_slug'

    def get_serializer_class(self):

        if self.action == "list":
            return CategoryListSerializer
        
        if self.action == "retrieve":
            return CategoryDetailSerializer
        
        return CategoryListSerializer

# class ProductFilter(django_filters.FilterSet):
#     category = django_filters.CharFilter(
#         field_name="category__category_slug",
#         lookup_expr="iexact"
#     )

#     class Meta:
#         model = Product
#         fields = ["category"]

class ProductListViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name", "description", "product_slug"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsStoreAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get("category")

        if category_slug:
            queryset = queryset.filter(category_id__category_slug=category_slug)

        return queryset