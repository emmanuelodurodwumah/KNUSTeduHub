from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from decimal import Decimal
import logging
import requests

from .serializers import PaymentInitializeSerializer
from .services import (
    initialize_paystack_payment,
    verify_paystack_payment
)

from Orders.models import Order
from Products.models import Product

logger = logging.getLogger(__name__)


class InitializePaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = PaymentInitializeSerializer(data=request.data)

        if serializer.is_valid():
            requested_items = serializer.validated_data["items"]
            quantities = {}
            for item in requested_items:
                product_id = item["product_id"]
                quantities[product_id] = quantities.get(product_id, 0) + item["quantity"]

            products = Product.objects.in_bulk(quantities)
            missing_product_ids = set(quantities) - set(products)
            if missing_product_ids:
                return Response(
                    {"error": "Product not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            amount = Decimal("0.00")
            for product_id, quantity in quantities.items():
                product = products[product_id]
                if product.stock_quantity < quantity:
                    return Response(
                        {"error": f"Insufficient stock for {product.name}."},
                        status=status.HTTP_409_CONFLICT,
                    )
                amount += product.price * quantity

            try:
                paystack_response, reference = initialize_paystack_payment(
                    amount,
                    request.user.email,
                )
            except (ValueError, requests.RequestException):
                logger.exception("Paystack payment initialization failed")
                return Response(
                    {"error": "Unable to initialize Paystack payment."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            if not paystack_response.get("status"):
                return Response(
                    {"error": paystack_response.get("message") or "Unable to initialize Paystack payment."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            paystack_data = paystack_response.get("data")
            authorization_url = (
                paystack_data.get("authorization_url")
                if isinstance(paystack_data, dict)
                else None
            )
            if not authorization_url:
                return Response(
                    {"error": "Paystack did not return an authorization URL."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            orders = Order.objects.bulk_create(
                [
                    Order(
                        user=request.user,
                        product=products[product_id],
                        quantity=quantity,
                        total_amount=products[product_id].price * quantity,
                        reference=reference,
                    )
                    for product_id, quantity in quantities.items()
                ]
            )

            return Response({
                "authorization_url": authorization_url,
                "reference": reference,
                "order_ids": [order.pk for order in orders],
                "amount": str(amount),
                "status": Order.Status.PENDING,
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class VerifyPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        orders = Order.objects.filter(reference=reference, user=request.user).select_related("product")
        if not orders.exists():
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not orders.exclude(status=Order.Status.PAID).exists():
            return Response(
                {
                    "message": "Payment already verified.",
                    "reference": reference,
                    "verified": True,
                    "status": "success",
                }
            )

        try:
            paystack_response = verify_paystack_payment(reference)
        except (ValueError, requests.RequestException):
            logger.exception("Paystack payment verification failed")
            return Response(
                {"error": "Unable to verify payment."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if not paystack_response.get("status"):
            return Response(
                {"error": paystack_response.get("message") or "Unable to verify payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_data = paystack_response.get("data")
        if not isinstance(payment_data, dict):
            return Response(
                {"error": "Paystack returned an invalid verification response."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        expected_amount = int(sum((order.total_amount for order in orders), Decimal("0.00")) * 100)
        if (
            payment_data.get("status") != "success"
            or payment_data.get("reference") != reference
            or payment_data.get("amount") != expected_amount
        ):
            return Response(
                {"message": "Payment is unsuccessful or does not match the order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            locked_orders = list(
                Order.objects.select_for_update()
                .filter(reference=reference, user=request.user)
                .select_related("product")
            )
            if not locked_orders:
                return Response(
                    {"error": "Order not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if all(order.status == Order.Status.PAID for order in locked_orders):
                return Response(
                    {
                        "message": "Payment already verified.",
                        "reference": reference,
                        "verified": True,
                        "status": "success",
                    }
                )

            quantities = {}
            for order in locked_orders:
                quantities[order.product_id] = quantities.get(order.product_id, 0) + order.quantity

            locked_products = Product.objects.select_for_update().in_bulk(quantities)
            for product_id, quantity in quantities.items():
                product = locked_products[product_id]
                if product.stock_quantity < quantity:
                    return Response(
                        {"error": f"Insufficient stock for {product.name}."},
                        status=status.HTTP_409_CONFLICT,
                    )

            for product_id, quantity in quantities.items():
                product = locked_products[product_id]
                product.stock_quantity -= quantity
                product.save(update_fields=["stock_quantity", "updated_at"])

            for order in locked_orders:
                order.status = Order.Status.PAID
                order.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "message": "Payment verified successfully.",
                "reference": reference,
                "verified": True,
                "status": "success",
            },
            status=status.HTTP_200_OK,
        )
