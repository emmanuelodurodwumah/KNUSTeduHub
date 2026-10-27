from rest_framework import serializers


class PaymentInitializeItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class PaymentInitializeSerializer(serializers.Serializer):
    items = PaymentInitializeItemSerializer(many=True, allow_empty=False)