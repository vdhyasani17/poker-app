import User from "../models/user.model.js";
import Game from "../models/game.model.js";
import bcrypt from "bcryptjs";

export const createGame = async (req, res) => {
    // gameId will be a randomly generated string
    const { gameId, password, maxPlayers } = req.body;
    try {
        if (gameId.length != 8) {
            return res.status(400).json({ message: "Game ID must be 8 characters long" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const game = await Game.findOne({ gameId });
        if (game) {
            return res.status(400).json({ message: "Game ID is currently being used by another game" });
        }

        const salt = await bcrypt.genSalt(5); // Salt with only 5 iterations to be a bit faster
        const hashedPassword = await bcrypt.hash(password, salt);

        const players = [];
        players.push(req.user._id); // Add game creator as the first player

        const newGame = new Game({
            gameId,
            password: hashedPassword,
            players,
            maxPlayers,
        })

        await newGame.save();

        return res.status(201).json({ message: `Game created: ${gameId}` });
    } catch (error) {
        console.log("Error in createGame controller (b): ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const joinGame = async (req, res) => {
    const { gameId, password } = req.body;

    try {
        if (!gameId || !password) {
            return res.status(400).json({ message: "Please fill out all fields" });
        }

        const game = await Game.findOne({ gameId }).populate("players");
        if (!game) {
            return res.status(400).json({ message: "Invalid game credentials" });
        }

        const correctPassword = await bcrypt.compare(password, game.password);
        if (!correctPassword) {
            return res.status(400).json({ message: "Invalid game credentials" });
        }

        if (game.players.length >= game.maxPlayers) {
            return res.status(400).json({ message: "Game is already full" });
        }

        if (game.players.some(p => p._id.equals(req.user._id))) {
            return res.status(400).json({ message: "You’ve already joined this game" });
        }

        game.players.push(req.user._id);
        await game.save();

        return res.status(200).json({ message: `Game joined: ${gameId}` });

    } catch (error) {
        console.log("Error in joinGame controller (b): ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/* TODO: Implement this function for route "/api/game/:id" */
export const getGameState = async (req, res) => {
    const { id: gameId } = req.params;

    try {
        const game = await Game.findOne({ gameId }).populate("players");

        if (!game) {
            return res.status(400).json({ message: `No game found with Game ID: ${gameId}` });
        }

        const players = game.players; // Now this includes full User objects
        return res.status(200).json({
            gameId,
            players,
        });
    } catch (error) {
        console.log("Error in getGameState controller: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Assumes you have access to req.user._id
export const exitGame = async (req, res) => {
    try {
        const userId = req.user._id; // Ensure req.user is set (via auth middleware)

        const game = await Game.findOne({ players: userId });
        if (!game) {
            return res.status(404).json({ message: "Game not found for this player" });
        }

        // Remove the player
        console.log("players before exit ", game.players);
        game.players = game.players.filter(playerId => playerId.toString() !== userId.toString());
        console.log("players after exit ", game.players);
        await game.save();

        res.status(200).json({ message: "Successfully exited game" });
    } catch (error) {
        console.error("Error in exitGame:", error);
        res.status(500).json({ message: "Failed to exit game" });
    }
};
