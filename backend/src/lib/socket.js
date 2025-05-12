import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Socket.io instance with CORS setup
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"], // Update this for your client URLs
    },
});

// Game state management
const gameSocketMap = {}; // { gameId: [{ userId, socketId }] }

/**
 * Broadcast the current player list to all players in a game.
 * @param {string} gameId - The game ID.
 */
function broadcastPlayerList(gameId) {
    const players = gameSocketMap[gameId] || [];
    const playerIds = players.map(player => player.userId);
    io.to(gameId).emit("playerListUpdate", { gameId, players: playerIds });
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle player joining a game
    socket.on("joinGame", ({ gameId, userId }) => {
        if (!gameId || !userId) {
            socket.emit("error", { message: "Invalid game or user ID" });
            return;
        }

        // Initialize game array if not present
        if (!gameSocketMap[gameId]) {
            gameSocketMap[gameId] = [];
        }

        // Check if user is already in the game
        const alreadyJoined = gameSocketMap[gameId].some(
            (player) => player.userId === userId
        );

        if (!alreadyJoined) {
            gameSocketMap[gameId].push({ userId, socketId: socket.id });
            socket.join(gameId); // Join the game room
            console.log(`${userId} joined game ${gameId}`);

            // Notify others in the room
            socket.to(gameId).emit("playerJoined", { userId });

            // Broadcast updated player list
            broadcastPlayerList(gameId);
        } else {
            console.log(`${userId} is already in game ${gameId}`);
        }

        // Emit confirmation back to the player who joined
        socket.emit("joinGame", { success: true, gameId });
    });

    // Handle player disconnecting
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);

        for (const gameId in gameSocketMap) {
            const players = gameSocketMap[gameId];

            for (let i = 0; i < players.length; i++) {
                if (players[i].socketId === socket.id) {
                    const disconnectedUserId = players[i].userId;
                    players.splice(i, 1); // Remove player from the game

                    // Notify remaining players
                    io.to(gameId).emit("playerLeft", { userId: disconnectedUserId });

                    // Broadcast updated player list
                    broadcastPlayerList(gameId);

                    // Cleanup the game if no players are left
                    if (players.length === 0) {
                        delete gameSocketMap[gameId];
                    }
                    break;
                }
            }
        }
    });

    // Handle player leaving a game manually
    socket.on("leaveGame", ({ gameId, userId }) => {
        if (!gameId || !userId) {
            socket.emit("error", { message: "Invalid game or user ID" });
            return;
        }

        const players = gameSocketMap[gameId] || [];
        const playerIndex = players.findIndex(player => player.socketId === socket.id);

        if (playerIndex !== -1) {
            const [leavingPlayer] = players.splice(playerIndex, 1);

            // Notify others in the room
            io.to(gameId).emit("playerLeft", { userId: leavingPlayer.userId });

            // Broadcast updated player list
            broadcastPlayerList(gameId);

            // Cleanup the game if no players are left
            if (players.length === 0) {
                delete gameSocketMap[gameId];
            }

            console.log(`${userId} left game ${gameId}`);
        } else {
            console.log(`User ${userId} was not found in game ${gameId}`);
        }

        socket.leave(gameId);
    });
});

export { io, app, server };