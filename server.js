// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import seedDatabase from "./db/seed.js";

import authRouter from "./routes/auth.js";
import feedRouter from "./routes/feed.js";
import interactionsRouter from "./routes/interactions.js";
import walletRouter from "./routes/wallet.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use("/auth", authRouter);
app.use("/feed", feedRouter);
app.use("/interact", interactionsRouter);
app.use("/wallet", walletRouter);

// Root
app.get("/", (req, res) => res.send("Mini Instagram Backend"));

// Startup
async function start() {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI not provided in env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        if (process.env.SEED_DB === "true") {
            await seedDatabase();
            console.log("🌱 Database seeded");
        }

        app.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error("❌ Startup error", err);
        process.exit(1);
    }
}

start();
