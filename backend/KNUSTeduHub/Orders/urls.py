from django.urls import path

from .views import AdminOrdersAPIView, UserOrdersAPIView


urlpatterns = [
    path("orders/admin/", AdminOrdersAPIView.as_view(), name="admin-orders"),
    path("orders/", UserOrdersAPIView.as_view(), name="user-orders"),
]
