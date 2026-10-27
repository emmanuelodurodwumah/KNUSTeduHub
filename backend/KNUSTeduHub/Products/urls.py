from django.urls import path, include
from .views import CategoryListViewSet, ProductListViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'categories', CategoryListViewSet, basename='categories')
router.register(r'products', ProductListViewSet, basename='products')

urlpatterns = [
    path("", include(router.urls)),
]