import express from "express";
import auth from "../middleware/auth.js";
import WalletTx from "../models/WalletTransaction.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /wallet -> balance + profile
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("name email avatar wallet_coins wallet_rupees");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            coins: user.wallet_coins || 0,
            rupees: user.wallet_rupees || 0,
        });
    } catch (err) {
        console.error("GET /wallet error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /wallet/payout  
router.post("/payout", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const rupees = user.wallet_rupees || 0;
        if (rupees <= 0) return res.status(400).json({ message: "No balance to payout" });

        await WalletTx.create({
            user: user._id,
            rupees: rupees,
            type: "payment under process"
        });
        user.wallet_coins = 0;
        user.wallet_rupees = 0;
        await user.save();

        res.json({
            wallet: {
                coins: 0,
                rupees: 0,
            },
            transaction: {
                requestDate: new Date().toISOString(),
                amount: rupees,
                process: "payment under process",
            },
            message: "Payout requested",

        });
    } catch (err) {
        console.error("Payout error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /wallet/watch/:postId
router.post("/watch/:postId", auth, async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userIdStr = req.user._id.toString();
        let coinsEarned = 0;

        const alreadyViewed = post.viewedBy.some(id => id.toString() === userIdStr);
        let creator;

        if (!alreadyViewed) {
            // Update post views
            post.views += 1;
            post.viewedBy.push(req.user._id);
            await post.save();

            creator = await User.findById(post.creator_id);
            if (creator) {
                coinsEarned = 10;
                creator.wallet_coins = (creator.wallet_coins || 0) + coinsEarned;
                creator.wallet_rupees = creator.wallet_coins / 10;
                await creator.save();
            }
        }
        res.json({
            message: alreadyViewed ? "Already watched" : "View counted and coins added",
            views: post.views,
            coins: creator?.wallet_coins || 0,
            rupees: creator?.wallet_rupees || 0,
        });
    } catch (err) {
        console.error("Watch error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// GET /wallet/transactions
router.get("/transactions", auth, async (req, res) => {
    try {
        const txs = await WalletTx.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json(
            txs.map(tx => ({
                requestDate: tx.createdAt,
                amount: tx.rupees,
                process: tx.type,
            }))
        );
    } catch (err) {
        console.error("Transactions error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;