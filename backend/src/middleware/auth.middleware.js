import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/* 
 * Function that checks the validity of the authorization token
 * If token is valid, send the user data to the API endpoint being called
 */
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - no token provided" })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);  /* Verify that the token is correct (signed by JWT_SECRET) */
        if (!decodedToken) {
            return res.status(401).json({ message: "Unauthorized - invalid token" })
        }

        const user = await User.findById(decodedToken.userId).select("-password"); /* Verify that user exists under token */
        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        req.user = user;    /* If token is valid, send user info to next function */

        next(); /* Function called after this one */

    } catch (error) {
        console.log("Error in protectRoute middleware (b): ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}