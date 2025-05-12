import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
    {
        gameId: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        maxPlayers: {
            type: Number,
            default: 6
        },

        status: {
            type: String,
            enum: ["waiting", "in-progress", "closed"],
            default: "waiting"
        },
    },
    { timestamps: true }
)

const Game = mongoose.model("Game", gameSchema);

export default Game;