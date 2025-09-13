// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) return res.status(401).json({ message: "Unauthorized: no token" });
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not set in env");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        if (!user) return res.status(401).json({ message: "Unauthorized: user not found" });

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
