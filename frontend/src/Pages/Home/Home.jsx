import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import useCartStore from "../../services/store";

import { Check, ChevronDown, ShoppingCart, X } from "lucide-react";
import Hero from "../../Components/Hero/Hero";

const getCategorySlug = (category) => category.slug ?? category.category_slug;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsCategory, setProductsCategory] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [cartToast, setCartToast] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get("search") ?? "").trim();
  const toastTimeout = useRef(null);
  const addItem = useCartStore((state) => state.addItem);
  const productsQuery = searchTerm ? `search:${searchTerm}` : selectedCategory ? `category:${selectedCategory}` : null;
  const productsLoading = productsQuery !== null && productsQuery !== productsCategory;

  const handleAddToCart = (product) => {
    addItem(product);
    setCartToast(product.name);
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setCartToast(""), 2800);
  };

  useEffect(() => () => clearTimeout(toastTimeout.current), []);

  useEffect(() => {
    api
      .get("categories/")
      .then((response) => {
        const data = response.data;
        const loadedCategories = Array.isArray(data) ? data : data.results ?? [];
        setCategories(loadedCategories);
        const initialCategory = loadedCategories.find(
          (category) => category.name === "Bags" && getCategorySlug(category),
        ) ?? loadedCategories.find(getCategorySlug);
        if (initialCategory) setSelectedCategory(getCategorySlug(initialCategory));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!productsQuery) return;

    let active = true;
    const params = productsQuery.startsWith("search:")
      ? { search: productsQuery.slice("search:".length) }
      : { category: productsQuery.slice("category:".length) };

    api
      .get("products/", { params })
      .then((response) => {
        if (!active) return;
        const data = response.data;
        setProducts(Array.isArray(data) ? data : data.results ?? []);
        setProductsCategory(productsQuery);
        setProductsError(null);
      })
      .catch((error) => {
        if (!active) return;
        console.error(error);
        setProducts([]);
        setProductsCategory(productsQuery);
        setProductsError({
          query: productsQuery,
          message: "Products could not be loaded. Please try again.",
        });
      });

    return () => {
      active = false;
    };
  }, [productsQuery]);

  return (
    <>

    <AnimatePresence>
      {cartToast && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-lg border border-emerald-200 bg-white p-4 shadow-lg sm:right-6"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <Check size={19} />
          </span>
          <p className="min-w-0 flex-1 text-sm font-medium text-gray-800">
            <span className="font-bold text-emerald-900">Added to cart</span>
            <span className="mt-0.5 block truncate text-gray-600">{cartToast}</span>
          </p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => {
              clearTimeout(toastTimeout.current);
              setCartToast("");
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={17} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    <Hero />

    <section className="w-full bg-white">

      <div className="flex mt-5 mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 text-2xl font-extrabold leading-tight text-emerald-950 sm:text-2xl lg:text-3xl">
        <h1>Categories </h1>
      </div>
{/*  ================= QUICK CATEGORY LINKS ================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-auto mt-5 flex max-w-7xl gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:px-6 lg:px-8"
      >

        {categories.map((i) => (
          <button
            key={i.id}
            disabled={!getCategorySlug(i)}
            onClick={() => {
              setSearchParams({});
              setSelectedCategory(getCategorySlug(i));
            }}
            className={`flex cursor-pointer shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium  transition ${
      selectedCategory === getCategorySlug(i)
        ? "bg-black text-white"
        : "bg-gray-100 text-gray-700"
    }`}
          >
            {i.name}
            <ChevronDown size={14} />
          </button>
        ))}

      </motion.div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-emerald-950 sm:text-2xl">
              {searchTerm ? `Search results for “${searchTerm}”` : categories.find((category) => getCategorySlug(category) === selectedCategory)?.name ?? "Products"}
            </h2>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="mt-1 text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
              >
                Clear search
              </button>
            )}
          </div>
          {!productsLoading && (!productsError || productsError.query !== productsQuery) && (
            <span className="text-sm text-gray-500">{products.length} products</span>
          )}
        </div>

        {productsLoading ? (
          <div className="py-12 text-center text-sm text-gray-500" role="status">
            Loading products...
          </div>
        ) : productsError && productsError.query === productsQuery ? (
          <p className="py-12 text-center text-sm text-red-700" role="alert">{productsError.message}</p>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            {searchTerm ? "No products found matching your search." : "No products found in this category."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const image = product.image_url ?? product.image ?? product.thumbnail ?? product.img;

              return (
                <article key={product.id} className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="aspect-4/3 bg-gray-50">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 sm:p-4">
                    <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1 hidden min-h-10 line-clamp-2 text-sm text-gray-500 sm:block">
                        {product.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-600 sm:mt-3 sm:text-sm">
                      {product.stock_quantity == null
                        ? "Stock unavailable"
                        : product.stock_quantity === 0
                          ? "Out of stock"
                          : `${product.stock_quantity} in stock`}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-1.5 sm:mt-4 sm:gap-3">
                      <p className="min-w-0 truncate text-sm font-bold text-emerald-800 sm:text-base">
                        {product.currency ? `${product.currency} ` : ""}
                        {product.price ?? "Price unavailable"}
                      </p>
                      <button
                        type="button"
                        aria-label={`Add ${product.name} to cart`}
                        disabled={product.stock_quantity === 0}
                        onClick={() => handleAddToCart(product)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-800 text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-gray-300 sm:h-10 sm:w-10"
                      >
                        <ShoppingCart size={16} className="sm:h-[18px] sm:w-[18px]" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

    </section>
    </>

  );
};

export default Home;




