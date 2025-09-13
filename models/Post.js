// models/Post.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    creator_name: { type: String, default: "" },
    content: { type: String, default: "" },
    url: { type: String, default: "" },
    type: { type: String, default: "image" },

    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    saves: { type: Number, default: 0 },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    shares: { type: Number, default: 0 },

    comments: [commentSchema],

}, { timestamps: true });

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
