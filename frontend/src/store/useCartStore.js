import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast"


export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    loading: false,

    getCartItems: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/cart");
            set({ cart: res.data.cartItems, loading: false });
            get().calculateTotal();
        } catch (error) {
            set({ cart: [], loading: false });
            toast.error("An error occurred while fetching cart");
        }
    },

    addToCart: async (product) => {
        try {
            await axios.post("/cart", { productId: product._id });
            toast.success("Product added to cart");

            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id);
                const newCart = existingItem
                    ? prevState.cart.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                    : [...prevState.cart, { ...product, quantity: 1 }];
                return { cart: newCart };
            });
            get().calculateTotal();
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred while adding to cart");
        }
    },

    calculateTotal: () => {
        const { cart, coupon } = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        if (coupon) {
            const discount = (subtotal * coupon.discountPercentage) / 100;
            total = subtotal - discount;
        }
        set({ subtotal, total });
    },

    removeFromCart: async (id) => {
        try {
            await axios.delete("/cart", { data: { productId: id } });
            toast.success("Product removed from cart");
            set((prevState) => ({
                cart: prevState.cart.filter((item) => item._id !== id)
            }));
            get().calculateTotal();
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred while removing from cart");
        }
    },

   updateQuantity: async (productId, quantity) => {
		if (quantity === 0) {
			get().removeFromCart(productId);
			return;
		}

		await axios.put(`/cart/${productId}`, { quantity });
		set((prevState) => ({
			cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
		}));
		get().calculateTotals();
	},
}));