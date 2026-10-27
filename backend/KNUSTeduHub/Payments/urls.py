from django.urls import path
from .views import InitializePaymentAPIView, VerifyPaymentAPIView


urlpatterns = [
    path("payments/initialize/", InitializePaymentAPIView.as_view(), name="payment-initialize"),
    path(
        "payments/verify/<str:reference>/",
        VerifyPaymentAPIView.as_view(),
        name="payment-verify",
    ),
]