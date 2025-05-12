import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"

const BASE_URL = "http://localhost:3000";

export const useGameStore = create((set, get) => ({
    currentGame: null,
    creatingGame: false,
    joiningGame: false,
    isGameLoading: false,
    socket: null,

    // Create a new game
    createGame: async (data) => {
        set({ creatingGame: true });
        try {
            const res = await axiosInstance.post("/game/create", data);
            set({ currentGame: res.data.game });
            toast.success("Game created successfully");
            get().connectSocket();
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to create game";
            toast.error(message);
            throw new Error();
        } finally {
            set({ creatingGame: false });
        }
    },

    // join an existing game
    joinGame: async (data) => {
        set({ joiningGame: true });
        try {
            const res = await axiosInstance.post("/game/join", data);
            set({ currentGame: res.data.game });
            toast.success("Game joined");
            get().connectSocket();
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to join game";
            toast.error(message);
            throw new Error();
        } finally {
            set({ joiningGame: false });
        }
    },

    // Fetch a game by ID
    fetchGame: async (gameId) => {
        set({ isGameLoading: true });
        try {
            const res = await axiosInstance.get(`/game/${gameId}`);
            set({ currentGame: res.data });
            console.log("current game: ", currentGame);
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to load game";
            toast.error(message);
        } finally {
            set({ isGameLoading: false });
        }
    },

    exitGame: async (gameId) => {
        try {
            await axiosInstance.post(`/game/exit`);
            toast.success("You left the game");

            set({ currentGame: null });

            window.location.href = "/";
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to exit game");
        }
    },

    // Reset current game (e.g. on leaving or ending a game)
    clearGame: () => {
        set({ currentGame: null });
    },

    connectSocket: () => {
        const { currentGame } = get();
        const authUser = get().authUser; // Make sure you have access to the logged-in user

        if (!currentGame || !authUser) {
            console.warn("Cannot connect socket: missing game or user info");
            return;
        }

        // Establish socket connection with userId in query
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });

        // Save socket instance in state
        set({ socket });

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);

            // Join game room immediately after connecting
            socket.emit("joinGame", {
                gameId: currentGame._id,
                userId: authUser._id,
            });
        });

        // Confirmation from server that we've joined
        socket.on("joinGame", (data) => {
            if (data.success) {
                console.log(`Joined game ${data.gameId} successfully`);
            } else {
                console.warn(`Failed to join game: ${data.message}`);
            }
        });

        // Player list update from server
        socket.on("playerListUpdate", ({ gameId, players }) => {
            console.log(`Updated players in game ${gameId}:`, players);
            set({ currentPlayers: players });
        });

        // When another player leaves
        socket.on("playerLeft", ({ userId }) => {
            console.log(`Player ${userId} left the game`);
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }
}));
