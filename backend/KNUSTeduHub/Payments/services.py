# payments/services.py

import uuid
import requests
from django.conf import settings


def initialize_paystack_payment(amount, email):
    reference = str(uuid.uuid4())

    payload = {
        "email": email,
        "amount": int(amount * 100),
        "reference": reference,
    }
    callback_url = getattr(settings, "PAYSTACK_CALLBACK_URL", None)
    if callback_url:
        payload["callback_url"] = callback_url

    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        "https://api.paystack.co/transaction/initialize",
        json=payload,
        headers=headers,
        timeout=15,
    )
    response.raise_for_status()

    return response.json(), reference

def verify_paystack_payment(reference):


    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"
    }

    response = requests.get(
        f"https://api.paystack.co/transaction/verify/{reference}",
        headers=headers,
        timeout=15,
    )
    response.raise_for_status()

    return response.json()