import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast"


export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    loading: false,
    isCouponApplied: false,

    // Fetch coupons (optional UI helper)
    getMyCoupon: async () => {
        try {
            const response = await axios.get("/coupons");
            set({ coupon: response.data.coupon,   isCouponApplied: !!response.data.coupon  });
        } catch (error) {
            console.error("Error fetching coupon:", error);
        }
    },

    // Apply coupon
    applyCoupon: async (couponCode) => {
        set({ loading: true });
        try {
            const res = await axios.post("/coupons/validate", { code: couponCode });

            // Create local coupon object
            const validatedCoupon = {
                code: res.data.code,
                discountPercentage: res.data.discount,
            };

            set({
                coupon: validatedCoupon,
                loading: false,
                isCouponApplied: true,
            });

            get().calculateTotal();
            toast.success("Coupon applied successfully!");
        } catch (error) {
            set({
                coupon: null,
                loading: false,
                isCouponApplied: false,
            });
            toast.error(error?.response?.data?.message || "Invalid or expired coupon");
        }
    },

    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotal();
        toast.success("Coupon removed successfully!");
    },


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

    clearCart: async () => {
        set({ cart: [], coupon: null, total: 0, subtotal: 0 });
    },

    //    clearCart: async () => {
    //     try {
    //         const res = await axios.delete("/cart");
    //         set({ cart: res.data.cartItems });
    //         get().calculateTotal();
    //     } catch (error) {
    //         toast.error(error?.response?.data?.message || "An error occurred while clearing cart");
    //     }
    // },

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
        get().calculateTotal();
    },
}));