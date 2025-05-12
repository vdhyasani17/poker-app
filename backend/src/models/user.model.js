import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true,
            minLength: 6
        },

        profilePic: {
            type: String,
            default: ""
        },

        chips: {
            type: Number,
            default: 100
        }
    }
)

const User = mongoose.model("User", userSchema);

export default User;