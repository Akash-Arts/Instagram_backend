// routes/wallet.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const WalletTx = require("../models/WalletTransaction");
const User = require("../models/User");
const Post = require("../models/Post");

// GET /wallet -> balance
// GET /wallet -> balance + profile
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("name email avatar wallet_balance");
        if (!user) return res.status(404).json({ message: "User not found" });

        const coins = user.wallet_balance || 0;
        const rupees = (coins / 10).toFixed(2);

        res.json({
            name: user.name,   // ✅ correct field
            email: user.email,
            avatar: user.avatar,
            coins,
            rupees,
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
        const coins = user.wallet_balance || 0;
        if (coins <= 0) return res.status(400).json({ message: "No balance to payout" });

        await WalletTx.create({ user: user._id, coins: -coins, type: "payout" });
        user.wallet_balance = 0;
        await user.save();

        res.json({
            message: "Payout requested",
            coins,
            rupees: (coins / 10).toFixed(2),
        });
    } catch (err) {
        console.error("Payout error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// routes/wallet.js
router.post("/watch/:postId", auth, async (req, res) => {
    try {
        const { postId } = req.params;
        console.log("Post ID:", postId);

        const user = await User.findById(req.user._id);
        console.log("User:", user);

        const post = await Post.findById(postId);
        console.log("Post:", post);

        if (!post) return res.status(404).json({ message: "Post not found" });

        const userIdStr = req.user._id.toString();
        let coinsEarned = 0;

        const alreadyViewed = post.viewedBy.some(id => id.toString() === userIdStr);
        console.log("Already viewed?", alreadyViewed);

        if (!alreadyViewed) {
            post.views += 1;
            post.viewedBy.push(req.user._id);
            await post.save();

            coinsEarned = 10;
            user.wallet_balance = (user.wallet_balance || 0) + coinsEarned;
            await user.save();

            await WalletTx.create({
                user: user._id,
                coins: coinsEarned,
                type: "earn",
                meta: { postId },
            });
        }

        res.json({
            message: alreadyViewed ? "Already watched" : "View counted and coins added",
            views: post.views,
            coins: user.wallet_balance,
            rupees: (user.wallet_balance / 10).toFixed(2),
        });
    } catch (err) {
        console.error("Watch error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.get("/transactions", auth, async (req, res) => {
    try {
        const txs = await WalletTx.find({ user: req.user._id })
            .sort({ createdAt: -1 }) // latest first
            .lean();

        res.json(
            txs.map(tx => ({
                requestDate: tx.createdAt,
                amount: tx.coins,
                process: tx.type, // "earn" or "payout"
            }))
        );
    } catch (err) {
        console.error("Transactions error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
