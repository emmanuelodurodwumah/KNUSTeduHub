import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  Package,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const filters = [
  { label: "All orders", value: "all" },
  { label: "Awaiting payment", value: "pending" },
  { label: "Confirmed", value: "paid" },
];

const formatAmount = (amount) => {
  const value = Number(amount);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-GH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    : "—";
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

const getErrorMessage = (error) =>
  error.response?.data?.detail ??
  error.response?.data?.error ??
  error.response?.data?.message ??
  "We couldn’t load your orders. Please try again.";

const StatusBadge = ({ status }) => {
  const isPaid = status === "PAID";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
        isPaid
          ? "bg-emerald-50 text-emerald-800"
          : "bg-amber-50 text-amber-800"
      }`}
    >
      {isPaid ? <Check size={14} /> : <Clock3 size={14} />}
      {isPaid ? "Payment confirmed" : "Awaiting payment"}
    </span>
  );
};

const OrderTimeline = ({ order }) => {
  const isPaid = order.status === "PAID";
  const steps = [
    {
      title: "Order placed",
      description: formatDate(order.created_at),
      done: true,
      icon: Package,
    },
    {
      title: isPaid ? "Payment confirmed" : "Payment pending",
      description: isPaid ? "Your payment has been verified." : "Complete payment to confirm this order.",
      done: isPaid,
      current: !isPaid,
      icon: isPaid ? ShieldCheck : Clock3,
    },
    {
      title: "Delivery updates",
      description: "Tracking details will appear here when your order is dispatched.",
      done: false,
      icon: Truck,
    },
  ];

  return (
    <ol className="grid gap-4 sm:grid-cols-3 sm:gap-3" aria-label="Order progress">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li key={step.title} className="relative flex gap-3 sm:flex-col">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-px sm:left-9 sm:top-[15px] sm:h-px sm:w-[calc(100%-1.5rem)] ${
                  index === 0 && isPaid ? "bg-emerald-300" : "bg-gray-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                step.done
                  ? "bg-emerald-700 text-white"
                  : step.current
                    ? "bg-amber-100 text-amber-800 ring-4 ring-amber-50"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon size={15} />
            </span>
            <div className="pb-4 sm:pb-0 sm:pl-1">
              <p className={`text-sm font-bold ${step.done || step.current ? "text-gray-900" : "text-gray-400"}`}>
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const OrderCard = ({ order, index }) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.16) }}
    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
  >
    <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-bold text-gray-950">Order {order.reference.slice(0, 8).toUpperCase()}</h2>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays size={14} />
          Placed {formatDate(order.created_at)}
        </p>
      </div>
      <div className="sm:text-right">
        <p className="text-xs font-medium text-gray-500">Order total</p>
        <p className="mt-1 text-xl font-extrabold tracking-tight text-emerald-950">
          {formatAmount(order.total_amount)}
        </p>
      </div>
    </div>

    <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </h3>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={`${order.reference}-${item.product_id}`} className="flex min-w-0 items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4f7f5] text-emerald-800">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Package size={21} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="mt-1 text-xs text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-gray-800">
                {formatAmount(item.total_amount)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-[#f8faf8] p-4 sm:p-5">
        <OrderTimeline order={order} />
      </div>
    </div>
  </motion.article>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    const response = await api.get("orders/");
    const data = response.data;
    return Array.isArray(data) ? data : data.results ?? [];
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchOrders()
      .then((loadedOrders) => {
        if (isMounted) {
          setOrders(loadedOrders);
          setError("");
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          console.error("Could not load orders:", requestError);
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fetchOrders]);

  const refreshOrders = () => {
    setIsLoading(true);
    setError("");
    fetchOrders()
      .then(setOrders)
      .catch((requestError) => {
        console.error("Could not load orders:", requestError);
        setError(getErrorMessage(requestError));
      })
      .finally(() => setIsLoading(false));
  };

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "paid" && order.status === "PAID") ||
        (activeFilter === "pending" && order.status !== "PAID");
      const matchesSearch =
        !normalizedSearch ||
        order.reference.toLowerCase().includes(normalizedSearch) ||
        order.items.some((item) => item.name.toLowerCase().includes(normalizedSearch));
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, orders, search]);

  const confirmedCount = orders.filter((order) => order.status === "PAID").length;
  const awaitingCount = orders.length - confirmedCount;
  const itemCount = orders.reduce(
    (total, order) => total + order.items.reduce((itemsTotal, item) => itemsTotal + item.quantity, 0),
    0,
  );

  return (
    <main className="min-h-[70vh] bg-[#f5f8f5] pb-16">
      <section className="border-b border-emerald-950/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
          >
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
                Your account
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
                Your orders
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
                Follow your purchases from checkout through payment confirmation. We’ll show delivery updates here when they’re available.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
            >
              Continue shopping <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total orders", value: orders.length, icon: Package },
              { label: "Payment confirmed", value: confirmedCount, icon: PackageCheck },
              { label: "Awaiting payment", value: awaitingCount, icon: Clock3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-[#fbfcfb] p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-2xl font-extrabold leading-none text-emerald-950">{value}</p>
                  <p className="mt-1.5 text-xs font-medium text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter orders">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "bg-emerald-800 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 sm:w-64">
              <Search size={17} className="shrink-0 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders"
                aria-label="Search by order reference or item"
                className="h-10 min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </label>
            <button
              type="button"
              onClick={refreshOrders}
              disabled={isLoading}
              aria-label="Refresh orders"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              aria-label="Loading orders"
            >
              {[0, 1].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center"
            >
              <CircleHelp size={30} className="mx-auto text-red-600" />
              <h2 className="mt-4 text-lg font-bold text-gray-900">Orders didn’t load</h2>
              <p role="alert" className="mt-2 text-sm text-gray-600">{error}</p>
              <button
                type="button"
                onClick={refreshOrders}
                className="mt-5 rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                Try again
              </button>
            </motion.div>
          ) : filteredOrders.length ? (
            <motion.div key="orders" layout className="space-y-4">
              <AnimatePresence initial={false}>
                {filteredOrders.map((order, index) => (
                  <OrderCard key={order.reference} order={order} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : orders.length ? (
            <motion.div
              key="no-matches"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center"
            >
              <Search size={28} className="mx-auto text-gray-400" />
              <h2 className="mt-4 text-lg font-bold text-gray-900">No matching orders</h2>
              <p className="mt-2 text-sm text-gray-600">Try another search or choose a different filter.</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <Package size={25} />
              </span>
              <h2 className="mt-5 text-xl font-bold text-emerald-950">No orders yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600">
                Once you place an order, you’ll be able to follow its payment status and view its items here.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
              >
                Explore the store <ArrowRight size={16} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !error && orders.length > 0 && (
          <p className="mt-5 text-center text-xs text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders · {itemCount} items total
          </p>
        )}
      </section>
    </main>
  );
};

export default Orders;
