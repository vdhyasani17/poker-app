import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useGameStore } from "./useGameStore.js";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isRegistering: false,
    isLoggingIn: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth (f): ", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    register: async (data) => {
        set({ isRegistering: true });
        try {
            const res = await axiosInstance.post("/auth/register", data)
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in register (f): ", error);
            set({ authUser: null });
        } finally {
            set({ isRegistering: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false })
        }
    },

    logout: async () => {
        await axiosInstance.post("/auth/logout");
        set({ authUser: null });
        const { disconnectSocket } = useGameStore();
        get().disconnectSocket();
    },

}));
