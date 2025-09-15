import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Like a post
router.post("/:postId/like", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userIdStr = req.user._id.toString();

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likedBy.some(id => id.toString() === userIdStr);
    if (alreadyLiked) return res.status(400).json({ message: "Already liked" });

    post.likes += 1;
    post.likedBy.push(req.user._id);
    await post.save();

    res.json({ likes: post.likes });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save a post
router.post("/:postId/save", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userIdStr = req.user._id.toString();

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const alreadySaved = post.savedBy.some(id => id.toString() === userIdStr);
    if (alreadySaved) return res.status(400).json({ message: "Already saved" });

    post.saves += 1;
    post.savedBy.push(req.user._id);
    await post.save();

    res.json({ saves: post.saves });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Share a post
router.post("/:postId/share", auth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.shares += 1;
    await post.save();

    res.json({ shares: post.shares });
  } catch (error) {
    console.error("Share error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Comment on a post
router.post("/:postId/comment", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      userId,
      username: req.user.name || "Unknown",
      text,
      createdAt: new Date()
    };
    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: "Comment added", comments: post.comments });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get comments
router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("comments.userId", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = post.comments.map(c => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      username: c.userId ? c.userId.name : c.username || "Unknown",
      avatar: c.userId?.avatar || ""
    }));

    res.json({ comments });
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;