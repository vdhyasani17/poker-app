import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "3d"
    });

    res.cookie("jwt", token, {
        maxAge: 3 * 24 * 60 * 60 * 1000, // MS, for 3 days
        httpOnly: true, // Prevents XSS attacks cross-site scripting attacks
        sameSite: "lax", // CSFR attacks cross-ste request forgery attacks
        secure: process.env.NODE_ENV !== "development"
    })

    return token;
}