import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import useCartStore from "../../services/store";

const CheckoutVerification = () => {
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const [verification, setVerification] = useState(() =>
    reference
      ? { status: "pending", message: "" }
      : {
          status: "failed",
          message: "No payment reference was provided. Please contact support if you were charged.",
        },
  );

  useEffect(() => {
    if (!reference) return;

    let isMounted = true;

    const verifyPayment = async () => {
      try {
        const response = await api.get(`/payments/verify/${encodeURIComponent(reference)}/`);
        const result = response.data;
        const isVerified = result?.verified === true && result?.status === "success";

        if (!isVerified) {
          throw new Error(result?.message ?? "The payment could not be verified.");
        }

        clearCart();
        if (isMounted) {
          setVerification({ status: "success", message: "Your payment was verified successfully." });
        }
      } catch (error) {
        console.error("Could not verify Paystack payment:", error);
        if (isMounted) {
          setVerification({
            status: "failed",
            message:
              error.response?.data?.error ??
              error.response?.data?.detail ??
              error.response?.data?.message ??
              error.message ??
              "Payment verification failed. Please contact support if you were charged.",
          });
        }
      }
    };

    verifyPayment();
    return () => {
      isMounted = false;
    };
  }, [clearCart, reference]);

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      {verification.status === "pending" ? (
        <>
          <span className="loading loading-spinner loading-lg text-emerald-800" aria-label="Verifying payment" />
          <h1 className="mt-5 text-2xl font-bold text-emerald-950">Verifying your payment</h1>
          <p className="mt-2 text-sm text-gray-600">Please wait while we confirm your transaction.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-emerald-950">
            {verification.status === "success" ? "Payment confirmed" : "Payment not confirmed"}
          </h1>
          <p
            role={verification.status === "failed" ? "alert" : "status"}
            className="mt-2 max-w-xl text-sm text-gray-600"
          >
            {verification.message}
          </p>
          <Link
            to={verification.status === "success" ? "/orders" : "/cart"}
            className="mt-6 rounded-md bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            {verification.status === "success" ? "Continue to orders" : "Return to cart"}
          </Link>
        </>
      )}
    </main>
  );
};

export default CheckoutVerification;
