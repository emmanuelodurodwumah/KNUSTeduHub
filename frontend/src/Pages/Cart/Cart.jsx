import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuthStore from "../../services/authStore";
import useCartStore from "../../services/store";

const formatPrice = (price, currency = "") => {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${currency ? `${currency} ` : ""}${price ?? "Price unavailable"}`;

  if (/^[A-Z]{3}$/i.test(currency)) {
    try {
      return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  return `${currency ? `${currency} ` : ""}${amount.toFixed(2)}`;
};

const Cart = () => {
  const items = useCartStore((state) => state.items);
  const setItemImages = useCartStore((state) => state.setItemImages);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [failedImages, setFailedImages] = useState({});
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);
  const currency = items[0]?.currency ?? "";

  useEffect(() => {
    if (!items.some((item) => !item.image)) return undefined;

    let active = true;
    api.get("products/")
      .then((response) => {
        if (!active) return;
        const data = response.data;
        const products = Array.isArray(data) ? data : data.results ?? [];
        const imagesById = Object.fromEntries(
          products
            .map((product) => [
              String(product.id),
              product.image_url ?? product.image ?? product.thumbnail ?? product.img ?? "",
            ])
            .filter(([, image]) => Boolean(image)),
        );
        setItemImages(imagesById);
      })
      .catch((error) => {
        if (active) console.error("Unable to restore cart product images:", error);
      });

    return () => {
      active = false;
    };
  }, [items, setItemImages]);

  const proceedToCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: { pathname: "/cart" } } });
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const response = await api.post("/payments/initialize/", {
        items: items.map(({ id, quantity }) => ({
          product_id: id,
          quantity,
        })),
      });
      const authorizationUrl =
        response.data?.data?.authorization_url ?? response.data?.authorization_url;

      if (typeof authorizationUrl !== "string" || !authorizationUrl) {
        throw new Error("The payment service did not return an authorization URL.");
      }

      window.location.assign(authorizationUrl);
    } catch (error) {
      console.error("Could not initialize Paystack checkout:", error);
      setCheckoutError(
        error.response?.data?.error ??
          error.response?.data?.detail ??
          error.response?.data?.message ??
          error.message ??
          "Unable to start checkout. Please try again.",
      );
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="min-h-[65vh] bg-[#f5f8f5] pb-16 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Your selection</p>
            <h1 className="text-3xl font-extrabold text-emerald-950 sm:text-4xl">Shopping cart</h1>
            <p className="mt-2 text-sm text-gray-600">
              {itemCount} {itemCount === 1 ? "item" : "items"} saved in your bag
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-semibold text-gray-500 underline decoration-gray-300 underline-offset-4 transition hover:text-red-700"
            >
              Clear cart
            </button>
          )}
        </motion.div>

        {items.length === 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
              <ShoppingBag size={28} strokeWidth={1.7} />
            </span>
            <h2 className="mt-5 text-xl font-bold text-emerald-950">Your cart is taking a breather</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600">
              Find something you love and it will be waiting here, even when you come back later.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              <ArrowLeft size={17} /> Explore the shop
            </Link>
          </motion.section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section aria-label="Cart items" className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white px-4 sm:px-6">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-[76px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:gap-5"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-[#f5f8f5]">
                      {item.image && !failedImages[item.id] ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={() => setFailedImages((current) => ({ ...current, [item.id]: true }))}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-emerald-700">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col justify-between gap-3 sm:py-1">
                      <div>
                        <h2 className="truncate font-bold text-gray-900">{item.name}</h2>
                        <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price, item.currency)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-9 items-center rounded-md border border-gray-200">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => item.quantity === 1 ? removeItem(item.id) : setQuantity(item.id, item.quantity - 1)}
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:text-emerald-800"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            disabled={item.quantity >= Number(item.stock_quantity ?? Infinity)}
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeItem(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <p className="col-span-2 text-right text-sm font-bold text-emerald-950 sm:col-span-1 sm:pt-2">
                      {formatPrice(Number(item.price || 0) * item.quantity, item.currency)}
                    </p>
                  </motion.article>
                ))}
              </AnimatePresence>
              <div className="py-5">
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950">
                  <ArrowLeft size={16} /> Continue shopping
                </Link>
              </div>
            </section>

            <aside className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-emerald-950">Order summary</h2>
              <div className="mt-5 space-y-4 border-b border-gray-100 pb-5 text-sm">
                <div className="flex justify-between gap-4 text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between gap-4 text-gray-600">
                  <span>Delivery</span>
                  <span className="text-right">Calculated at checkout</span>
                </div>
              </div>
              <div className="flex justify-between gap-4 py-5 text-base font-bold text-emerald-950">
                <span>Estimated total</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              {checkoutError && (
                <p role="alert" className="mb-3 text-sm text-red-700">
                  {checkoutError}
                </p>
              )}
              <button
                type="button"
                onClick={proceedToCheckout}
                disabled={isCheckingOut}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCheckingOut ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" /> Starting secure checkout...
                  </>
                ) : (
                  <>
                    Proceed to checkout <ArrowRight size={17} />
                  </>
                )}
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={15} className="text-emerald-700" /> Secure checkout
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;