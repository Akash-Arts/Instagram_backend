// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function (req, res, next) {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) return res.status(401).json({ message: "Unauthorized: no token" });
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not set in env");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return res.status(401).json({ message: "Token expired" });
        }
        const user = await User.findById(payload.id).select("-password");
        if (!user) return res.status(401).json({ message: "Unauthorized: user not found" });

        req.user = user;
        next();
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }

        console.error("Auth middleware error:", err);
        return res.status(401).json({ message: "Unauthorized" });
    }
}