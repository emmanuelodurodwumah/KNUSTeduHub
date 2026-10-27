import { create } from "zustand";
import { persist } from "zustand/middleware";

const getStockLimit = (product) => {
	if (product.stock_quantity == null || product.stock_quantity === "") return Infinity;
	const stock = Number(product.stock_quantity);
	return Number.isFinite(stock) && stock >= 0 ? stock : Infinity;
};

const getProductImage = (product) =>
	product.image_url ?? product.image ?? product.thumbnail ?? product.img ?? "";

const useCartStore = create(
	persist(
		(set) => ({
			items: [],
			addItem: (product) =>
				set((state) => {
					if (getStockLimit(product) === 0) return state;

					const existingItem = state.items.find((item) => item.id === product.id);
					if (existingItem) {
						return {
							items: state.items.map((item) =>
								item.id === product.id
									? {
											...item,
											quantity: Math.min(item.quantity + 1, getStockLimit(product)),
											image: item.image || getProductImage(product),
										}
									: item,
							),
						};
					}

					return {
						items: [
							...state.items,
							{
								id: product.id,
								name: product.name,
								price: product.price,
								currency: product.currency ?? "",
								image: getProductImage(product),
								stock_quantity: product.stock_quantity,
								quantity: 1,
							},
						],
					};
				}),
			setItemImages: (imagesById) =>
				set((state) => {
					const hasImageToRestore = state.items.some(
						(item) => !item.image && imagesById[String(item.id)],
					);
					if (!hasImageToRestore) return state;
					return {
						items: state.items.map((item) => ({
							...item,
							image: item.image || imagesById[String(item.id)] || "",
						})),
					};
				}),
			setQuantity: (id, quantity) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.id === id
							? {
									...item,
									quantity: Math.max(1, Math.min(quantity, getStockLimit(item))),
								}
							: item,
					),
				})),
			removeItem: (id) =>
				set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
			clearCart: () => set({ items: [] }),
		}),
		{
			name: "digistore-cart",
			version: 1,
			partialize: (state) => ({ items: state.items }),
		},
	),
);

export default useCartStore;
