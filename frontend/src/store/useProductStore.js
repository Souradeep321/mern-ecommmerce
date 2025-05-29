import { create } from 'zustand'
import axios from '../lib/axios'
import { toast } from "react-hot-toast"


export const useProductStore = create((set) => ({
    products: [],
    loading: false,

    setProducts: (products) => set({ products }),

    createProduct: async (product) => {
        set({ loading: true });
        try {
            const res = await axios.post("/products", product);
            set((state) => ({
                products: [...state.products, res.data],
                loading: false
            }));
            toast.success("Product created successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred");
            set({ loading: false });
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/products");
            set({ products: res.data.products, loading: false });
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred while fetching products");
            set({ loading: false });
        }
    },
    deleteProduct: async (id) => {
        set({ loading: true });
        try {
            await axios.delete(`/products/${id}`);
            set((state) => ({
                products: state.products.filter((product) => product._id !== id),
                loading: false
            }));
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred");
            set({ loading: false });
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({ loading: true });
        try {
            const res = await axios.patch(`/products/${productId}`);
            console.log("Toggle response:", res.data); // ✅ Debug

            const updatedProduct = res.data.product;
            if (!updatedProduct || typeof updatedProduct.isFeatured === "undefined") {
                throw new Error("Invalid response structure");
            }

            set((state) => ({
                products: state.products.map((product) =>
                    product._id === productId
                        ? { ...product, isFeatured: updatedProduct.isFeatured }
                        : product
                ),
                loading: false
            }));

            toast.success("Product updated successfully");
        } catch (error) {
            set({ loading: false });
            console.error("Toggle featured error:", error); // ✅ Log real error
            toast.error(error?.response?.data?.message || error.message || "An error occurred");
        }
    },

    fetchProductsByCategory: async (category) => {
        set({ loading: true });
        try {
            const res = await axios.get(`/products/category/${category}`);
            set({ products: res.data.products, loading: false });
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred while fetching products by category");
            set({ loading: false });
        }
    },

    fetchRecommendedProducts: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/products/recommendations");
            set({ products: res.data.products, loading: false });
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred while fetching recommended products");
            set({ loading: false });
        }
    },

}))


