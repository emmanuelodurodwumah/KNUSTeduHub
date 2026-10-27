from decimal import Decimal

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from Products.permissions import IsStoreAdmin
from .models import Order


def serialize_orders(order_lines, request, include_customer=False):
    grouped_orders = {}

    for order in order_lines:
        product = order.product
        image_url = None
        if product.img:
            image_url = request.build_absolute_uri(product.img.url)

        order_data = {
            "reference": order.reference,
            "status": order.status,
            "created_at": order.created_at,
            "total_amount": Decimal("0.00"),
            "items": [],
        }
        if include_customer:
            order_data["customer"] = {
                "username": order.user.username,
                "email": order.user.email,
                "first_name": order.user.first_name,
                "last_name": order.user.last_name,
            }
        grouped_order = grouped_orders.setdefault(order.reference, order_data)
        grouped_order["total_amount"] += order.total_amount
        grouped_order["items"].append(
            {
                "product_id": str(product.pk),
                "product_slug": product.product_slug,
                "name": product.name,
                "image_url": image_url,
                "quantity": order.quantity,
                "total_amount": str(order.total_amount),
            }
        )

    return [
        {
            **order,
            "created_at": order["created_at"].isoformat(),
            "total_amount": str(order["total_amount"]),
        }
        for order in grouped_orders.values()
    ]


class UserOrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        order_lines = (
            Order.objects.filter(user=request.user)
            .select_related("product", "user")
            .order_by("-created_at", "-pk")
        )
        return Response(serialize_orders(order_lines, request))


class AdminOrdersAPIView(APIView):
    permission_classes = [IsStoreAdmin]

    def get(self, request):
        order_lines = (
            Order.objects.select_related("product", "user")
            .order_by("-created_at", "-pk")
        )
        return Response(serialize_orders(order_lines, request, include_customer=True))
