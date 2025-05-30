import { create } from 'zustand'
import axios from '../lib/axios'
import { toast } from "react-hot-toast"


export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true })

        if (password !== confirmPassword) {
            set({ loading: false })
            return toast.error("Passwords do not match");
        }

        try {
            const res = await axios.post("/auth/signup", { name, email, password })
            set({ user: res.data, loading: false })
            toast.success("User created successfully");
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "An error occured");
        }
    },

    login: async ({ email, password }) => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/login", { email, password });
            set({ user: res.data, loading: false });
            toast.success("User logged in successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error?.response?.data?.message || "An error occurred");
        }
    },

    logout: async () => {
        try {
            const res = await axios.post("/auth/logout");
            set({ user: null })
            toast.success("User logged out successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "An error occurred during logout");
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true })
        try {
            const res = await axios.get("/auth/profile");
            set({ user: res.data, checkingAuth: false })
        } catch (error) {
            console.log("Error checking auth", error);
            set({ checkingAuth: false })
        }
    },

    refreshToken: async () => {
        if (get().checkingAuth) return

        set({ checkingAuth: true })
        try {
            const res = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false });
            return res.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    }

}))

// TODO: add refresh token 

let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (refreshPromise) {
                    await refreshPromise;
                } else {
                    refreshPromise = useUserStore.getState().refreshToken();
                    await refreshPromise;
                    refreshPromise = null;
                }

                return axios(originalRequest);
            } catch (refreshError) {
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
