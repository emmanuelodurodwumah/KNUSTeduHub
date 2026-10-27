import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import api from "../../services/api";

const formatCurrency = (value, currency = "GHS") =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: /^[A-Z]{3}$/.test(currency) ? currency : "GHS",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getProductCategory = (product) =>
  typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "Uncategorized";

const getProductImage = (product) =>
  product.image_url ?? product.image ?? product.thumbnail ?? product.img;

const getStockStatus = (quantity) => {
  if (quantity <= 0) return { label: "Out of stock", className: "bg-rose-50 text-rose-700" };
  if (quantity <= 10) return { label: "Low stock", className: "bg-amber-50 text-amber-700" };
  return { label: "In stock", className: "bg-emerald-50 text-emerald-700" };
};

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryLoadError, setCategoryLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All statuses");
  const [filter, setFilter] = useState("All products");
  const [productModal, setProductModal] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await api.get("products/");
      const data = response.data;
      setProducts(Array.isArray(data) ? data : data.results ?? []);
    } catch (error) {
      console.error("Unable to load admin products:", error);
      setLoadError("We couldn't load your products. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const response = await api.get("orders/admin/");
      const data = response.data;
      setOrders(Array.isArray(data) ? data : data.results ?? []);
    } catch (error) {
      console.error("Unable to load admin orders:", error);
      setOrdersError("Orders couldn't be loaded. Check your connection and try again.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get("products/")
      .then((response) => {
        if (!active) return;
        const data = response.data;
        setProducts(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unable to load admin products:", error);
        setLoadError("We couldn't load your products. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api.get("categories/")
      .then((response) => {
        if (!active) return;
        const data = response.data;
        setCategories(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch((error) => {
        if (active) {
          console.error("Unable to load product categories:", error);
          setCategoryLoadError(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api.get("orders/admin/")
      .then((response) => {
        if (!active) return;
        const data = response.data;
        setOrders(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unable to load admin orders:", error);
        setOrdersError("Orders couldn't be loaded. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const summary = useMemo(() => {
    const units = products.reduce((total, product) => total + (Number(product.stock_quantity) || 0), 0);
    const inventoryValue = products.reduce(
      (total, product) => total + (Number(product.price) || 0) * (Number(product.stock_quantity) || 0),
      0,
    );
    const lowStock = products.filter((product) => {
      const stock = Number(product.stock_quantity) || 0;
      return stock <= 10;
    }).length;
    return { units, inventoryValue, lowStock };
  }, [products]);

  const categoryReport = useMemo(() => {
    const totals = products.reduce((result, product) => {
      const category = getProductCategory(product);
      result[category] = (result[category] ?? 0) + (Number(product.stock_quantity) || 0);
      return result;
    }, {});
    return Object.entries(totals)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 5);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [product.name, getProductCategory(product), product.id]
          .some((value) => String(value ?? "").toLowerCase().includes(query));
      const stock = Number(product.stock_quantity) || 0;
      const matchesFilter =
        filter === "All products" ||
        (filter === "Low stock" && stock > 0 && stock <= 10) ||
        (filter === "Out of stock" && stock <= 0);
      return matchesSearch && matchesFilter;
    });
  }, [filter, products, search]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const customer = order.customer ?? {};
      const matchesSearch =
        !query ||
        [
          order.reference,
          customer.username,
          customer.email,
          customer.first_name,
          customer.last_name,
          ...order.items.map((item) => item.name),
        ].some((value) => String(value ?? "").toLowerCase().includes(query));
      const matchesStatus =
        orderStatusFilter === "All statuses" || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orderSearch, orderStatusFilter, orders]);

  const saveProduct = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = new FormData();
    payload.set("name", String(formData.get("name")).trim());
    payload.set("category_id", String(formData.get("category_id")));
    payload.set("description", String(formData.get("description")).trim());
    payload.set("price", String(formData.get("price")));
    payload.set("stock_quantity", String(formData.get("stock_quantity")));
    const image = formData.get("img");
    if (image instanceof File && image.size > 0) payload.set("img", image);
    setSaving(true);
    try {
      if (productModal?.id != null) {
        await api.patch(`products/${productModal.id}/`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setNotice("Product updated successfully.");
      } else {
        await api.post("products/", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setNotice("Product added successfully.");
      }
      setProductModal(null);
      await loadProducts();
    } catch (error) {
      console.error("Unable to save product:", error);
      const validationMessage = Object.entries(error.response?.data ?? {})
        .flatMap(([field, errors]) =>
          (Array.isArray(errors) ? errors : [errors]).map((message) => `${field}: ${message}`),
        )[0];
      setNotice(`Product couldn't be saved. ${validationMessage ?? "Please try again."}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`products/${product.id}/`);
      setNotice("Product deleted successfully.");
      await loadProducts();
    } catch (error) {
      console.error("Unable to delete product:", error);
      setNotice("Product couldn't be deleted. Please try again.");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="flex min-h-screen">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            />
          )}
        </AnimatePresence>

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <a href="/" className="mb-10 flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <ShoppingBag size={21} />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">eduHub</span>
          </a>

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <nav aria-label="Admin navigation" className="space-y-1">
            <a href="#overview" onClick={closeSidebar} className="flex items-center gap-3 rounded-xl bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-700">
              <LayoutDashboard size={18} /> Overview
            </a>
            <a href="#inventory" onClick={closeSidebar} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              <Package size={18} /> Products
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{products.length}</span>
            </a>
            <a href="#orders" onClick={closeSidebar} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              <ClipboardList size={18} /> Orders
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{orders.length}</span>
            </a>
            <a href="#reports" onClick={closeSidebar} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              <TrendingUp size={18} /> Reports
            </a>
          </nav>

          <p className="mb-3 mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Preferences</p>
          <nav className="space-y-1">
            <a href="#settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              <Settings size={18} /> Settings
            </a>
            <a href="#help" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              <CircleHelp size={18} /> Help center
            </a>
          </nav>

          <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Boxes size={18} />
            </div>
            <p className="text-sm font-semibold">Keep stock up to date</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">Track inventory in one place and stay ahead of low-stock items.</p>
            <a href="#inventory" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-300">View inventory <ArrowUpRight size={14} /></a>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7 lg:px-10">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
                <Menu size={20} />
              </button>
              <div className="hidden text-sm text-slate-400 sm:block">Workspace <span className="mx-2">/</span></div>
              <h1 className="text-sm font-semibold text-slate-800">Overview</h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 md:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Store is active
              </div>
              <button type="button" aria-label="Notifications" className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
                <Bell size={19} />
                {summary.lowStock > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">EH</div>
            </div>
          </header>

          <div className="mx-auto max-w-360 px-4 py-7 sm:px-7 lg:px-10 lg:py-9">
            <motion.section id="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Here’s what’s happening with your store.</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">Good day, Admin <span aria-hidden="true">✦</span></h2>
                </div>
                <button type="button" onClick={() => { setSelectedCategoryId(""); setProductModal({}); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  <Plus size={17} /> Add product
                </button>
              </div>

              {loadError && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                  <span>{loadError}</span>
                  <button type="button" onClick={loadProducts} className="font-semibold underline underline-offset-2">Try again</button>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard title="Total products" value={loading || loadError ? "—" : products.length.toLocaleString()} description="Products in your catalog" icon={Package} iconClass="bg-violet-50 text-violet-700" />
                <SummaryCard title="Inventory units" value={loading || loadError ? "—" : summary.units.toLocaleString()} description="Units across all products" icon={Boxes} iconClass="bg-sky-50 text-sky-700" />
                <SummaryCard title="Inventory value" value={loading || loadError ? "—" : formatCurrency(summary.inventoryValue)} description="Based on current stock × price" icon={TrendingUp} iconClass="bg-emerald-50 text-emerald-700" />
                <SummaryCard title="Needs attention" value={loading || loadError ? "—" : summary.lowStock.toLocaleString()} description="Products with 10 units or less" icon={ArrowDownRight} iconClass="bg-amber-50 text-amber-700" alert={summary.lowStock > 0} />
              </div>
            </motion.section>

            <section id="reports" className="mt-7 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">Inventory by category</h3>
                    <p className="mt-1 text-sm text-slate-500">Available units in your catalog</p>
                  </div>
                  <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500">Live inventory</span>
                </div>
                {categoryReport.length === 0 ? (
                  <div className="flex h-52 items-center justify-center text-sm text-slate-400">{loading ? "Loading inventory…" : loadError ? "Inventory report is unavailable until products load." : "Add products to see your category report."}</div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {categoryReport.map(([category, quantity], index) => {
                      const maxQuantity = Math.max(...categoryReport.map((entry) => entry[1]), 1);
                      const colors = ["bg-teal-500", "bg-violet-500", "bg-sky-500", "bg-amber-500", "bg-rose-400"];
                      return (
                        <div key={category} className="grid grid-cols-[minmax(90px,1fr)_2fr_48px] items-center gap-3">
                          <span className="truncate text-sm font-medium text-slate-600">{category}</span>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(quantity / maxQuantity) * 100}%` }} transition={{ duration: 0.6, delay: index * 0.08 }} className={`h-full rounded-full ${colors[index]}`} />
                          </div>
                          <span className="text-right text-sm font-semibold tabular-nums text-slate-800">{quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                  <TrendingUp size={14} /> Report is calculated from current product stock.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Stock health</h3>
                    <p className="mt-1 text-sm text-slate-500">Current catalog availability</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><SlidersHorizontal size={18} /></span>
                </div>
                <div className="mt-6 flex items-end justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-3xl font-bold tracking-tight">{loading || loadError ? "—" : summary.units.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-slate-500">total available units</p>
                  </div>
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><ArrowUpRight size={13} /> Live</span>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock</span><span className="font-semibold">{loading || loadError ? "—" : products.filter((product) => Number(product.stock_quantity) > 10).length}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-amber-400" /> Low stock</span><span className="font-semibold">{loading || loadError ? "—" : products.filter((product) => Number(product.stock_quantity) > 0 && Number(product.stock_quantity) <= 10).length}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full bg-rose-500" /> Out of stock</span><span className="font-semibold">{loading || loadError ? "—" : products.filter((product) => Number(product.stock_quantity) <= 0).length}</span></div>
                </div>
              </div>
            </section>

            <section id="inventory" className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Product inventory</h3>
                  <p className="mt-1 text-sm text-slate-500">Manage your products and stock levels</p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <label className="relative min-w-47.5 flex-1 sm:flex-none">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products…" aria-label="Search products" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                  </label>
                  <label className="relative">
                    <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter products by stock" className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                      <option>All products</option><option>Low stock</option><option>Out of stock</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </label>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-185 text-left">
                  <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-3.5">Product</th><th className="px-4 py-3.5">Category</th><th className="px-4 py-3.5">Price</th><th className="px-4 py-3.5">Stock</th><th className="px-4 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="6" className="px-6 py-14 text-center text-sm text-slate-400">Loading products…</td></tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-14 text-center text-sm text-slate-400">{products.length ? "No products match your search." : loadError ? "Products are unavailable until the connection is restored." : "No products yet. Add your first product to get started."}</td></tr>
                    ) : filteredProducts.map((product) => {
                      const quantity = Number(product.stock_quantity) || 0;
                      const status = getStockStatus(quantity);
                      const image = getProductImage(product);
                      return (
                        <tr key={product.id} className="transition hover:bg-slate-50/70">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              {image ? <img src={image} alt="" className="h-10 w-10 rounded-lg border border-slate-100 object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Package size={18} /></span>}
                              <div className="min-w-0"><p className="max-w-55 truncate text-sm font-semibold text-slate-800">{product.name}</p><p className="mt-0.5 text-xs text-slate-400">ID: {product.id}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-500">{getProductCategory(product)}</td>
                          <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{formatCurrency(product.price, product.currency || "GHS")}</td>
                          <td className="px-4 py-3.5 text-sm font-semibold tabular-nums text-slate-700">{quantity}</td>
                          <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" onClick={() => { setSelectedCategoryId(String(product.category_id ?? "")); setProductModal(product); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50">Edit</button>
                              <button type="button" aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><MoreHorizontal size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 text-xs text-slate-500 sm:px-6">
                <span>Showing {filteredProducts.length} of {products.length} products</span>
                <button type="button" onClick={loadProducts} disabled={loading} className="font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-50">Refresh inventory</button>
              </div>
            </section>

            <section id="orders" className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Order management</h3>
                  <p className="mt-1 text-sm text-slate-500">Review every customer order and its payment status</p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <label className="relative min-w-47.5 flex-1 sm:flex-none">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={orderSearch}
                      onChange={(event) => setOrderSearch(event.target.value)}
                      placeholder="Search orders…"
                      aria-label="Search orders"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <label className="relative">
                    <select
                      value={orderStatusFilter}
                      onChange={(event) => setOrderStatusFilter(event.target.value)}
                      aria-label="Filter orders by status"
                      className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    >
                      <option>All statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </label>
                </div>
              </div>
              {ordersError && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-800" role="alert">
                  <span>{ordersError}</span>
                  <button type="button" onClick={loadOrders} className="font-semibold underline underline-offset-2">Try again</button>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-220 text-left">
                  <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-3.5">Order</th>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Items</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Total</th>
                      <th className="px-5 py-3.5">Payment status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersLoading ? (
                      <tr><td colSpan="6" className="px-6 py-14 text-center text-sm text-slate-400">Loading orders…</td></tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-14 text-center text-sm text-slate-400">{ordersError ? "Orders are unavailable until the connection is restored." : orders.length ? "No orders match your search or filter." : "There are no orders yet."}</td></tr>
                    ) : filteredOrders.map((order) => {
                      const customerName = [order.customer?.first_name, order.customer?.last_name]
                        .filter(Boolean)
                        .join(" ") || order.customer?.username || "Customer";
                      const isPaid = order.status === "PAID";
                      return (
                        <tr key={order.reference} className="align-top transition hover:bg-slate-50/70">
                          <td className="px-6 py-4">
                            <p className="max-w-56 truncate text-sm font-semibold text-slate-800" title={order.reference}>{order.reference}</p>
                            <p className="mt-1 text-xs text-slate-400">{order.items.length} {order.items.length === 1 ? "line item" : "line items"}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-slate-700">{customerName}</p>
                            <p className="mt-1 text-xs text-slate-400">{order.customer?.email || order.customer?.username || "—"}</p>
                          </td>
                          <td className="max-w-64 px-4 py-4">
                            <ul className="space-y-1">
                              {order.items.slice(0, 3).map((item, index) => (
                                <li key={`${item.product_id}-${index}`} className="truncate text-sm text-slate-600" title={item.name}>
                                  {item.name} <span className="text-slate-400">× {item.quantity}</span>
                                </li>
                              ))}
                              {order.items.length > 3 && <li className="text-xs text-slate-400">+{order.items.length - 3} more</li>}
                            </ul>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">{formatCurrency(order.total_amount)}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                              {isPaid ? "Paid" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 text-xs text-slate-500 sm:px-6">
                <span>Showing {filteredOrders.length} of {orders.length} orders</span>
                <button type="button" onClick={loadOrders} disabled={ordersLoading} className="font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-50">Refresh orders</button>
              </div>
            </section>
            <footer className="py-6 text-center text-xs text-slate-400">digiStore Admin · Inventory updates are saved to your store.</footer>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {productModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setProductModal(null); }}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="product-modal-title" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
              <div className="mb-6 flex items-start justify-between">
                <div><h2 id="product-modal-title" className="text-lg font-bold">{productModal.id != null ? "Edit product" : "Add a product"}</h2><p className="mt-1 text-sm text-slate-500">Enter product details and inventory quantity.</p></div>
                <button type="button" aria-label="Close dialog" disabled={saving} onClick={() => setProductModal(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
              </div>
              <form onSubmit={saveProduct} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
                <label className="block text-sm font-medium text-slate-700">Product name<input name="name" required maxLength={100} defaultValue={productModal.name ?? ""} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="e.g. Everyday tote bag" /></label>
                <label className="block text-sm font-medium text-slate-700">Category<select name="category_id" required value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"><option value="" disabled>{categoryLoadError ? "Categories unavailable" : "Select a category"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{categoryLoadError ? <span className="mt-1 block text-xs font-normal text-rose-600">Categories could not be loaded. Refresh the page and try again.</span> : categories.length === 0 && <span className="mt-1 block text-xs font-normal text-amber-700">Add a product category before creating products.</span>}</label>
                <label className="block text-sm font-medium text-slate-700">Description<textarea name="description" rows="3" defaultValue={productModal.description ?? ""} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="Describe this product for your customers." /></label>
                <label className="block text-sm font-medium text-slate-700">Product image<input name="img" type="file" accept="image/*" className="mt-1.5 block w-full cursor-pointer rounded-xl border border-slate-200 text-sm text-slate-600 file:mr-3 file:border-0 file:bg-slate-50 file:px-3 file:py-2.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-100" />{getProductImage(productModal) && <span className="mt-1 block text-xs font-normal text-slate-400">Current image is kept unless you choose a replacement.</span>}</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-slate-700">Price<input name="price" type="number" min="0" step="0.01" required defaultValue={productModal.price ?? ""} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="0.00" /></label>
                  <label className="block text-sm font-medium text-slate-700">Stock quantity<input name="stock_quantity" type="number" min="0" step="1" required defaultValue={productModal.stock_quantity ?? ""} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="0" /></label>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" disabled={saving} onClick={() => setProductModal(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={saving || categories.length === 0} className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{saving ? "Saving…" : <><Check size={16} /> Save product</>}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notice && <motion.div role={notice.includes("couldn't") ? "alert" : "status"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-5 right-5 z-60 max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg">{notice}</motion.div>}
      </AnimatePresence>
    </div>
  );
};

const SummaryCard = ({ title, value, description, icon: Icon, iconClass, alert = false }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}><Icon size={19} /></span>
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${alert ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"}`}>
        {alert ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
        {alert ? "Review" : "Live"}
      </span>
    </div>
    <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{description}</p>
  </article>
);

export default Admin;
