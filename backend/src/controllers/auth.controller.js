import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

export const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: "Please fill out all fields" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists with provided username" })
        }

        const salt = await bcrypt.genSalt(5); // Salt with only 5 iterations to be a bit faster
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        // If newUser is successfully created...
        if (newUser) {
            //Generate jwt token 
            //res will send cookie with token
            generateToken(newUser._id, res);
            await newUser.save();   // Save newUser to db

            res.status(201).json({
                newUser
            });
        }
    } catch (error) {
        console.log("Error in register controller (b): ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        generateToken(user._id, res);

        return res.status(200).json({
            user
        })
    } catch (error) {
        console.log("Error in login controller (b): ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })  // Invalidate token when logging out
        return res.status(200).json({ message: "Successfully logged out" })
    } catch (error) {
        console.log("Error in logout controller (b): ", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}


// Function that checks authentication of user at different route
export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch {
        console.log("Error in checkAuth controller (b): ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}