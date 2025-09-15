import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
    },
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'), false);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    }
});

// GET /feed
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("creator_id", "name");
        res.json(posts);
    } catch (err) {
        console.error("GET /feed error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /feed/creator/posts
router.get("/creator/posts", auth, async (req, res) => {
    try {
        const posts = await Post.find({ creator_id: req.user._id }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error("Error fetching creator posts:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /feed/upload
router.post("/upload", auth, upload.single("file"), async (req, res) => {
    try {
        let fileUrl = req.body.url || "";
        if (req.file) {
            fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        const { type, content } = req.body;
        if (!fileUrl || !type) {
            return res.status(400).json({ message: "Missing file/url or type" });
        }

        const post = await Post.create({
            creator_id: req.user._id,
            creator_name: req.user.name || "",
            type,
            url: fileUrl,
            content: content || "",
        });

        res.status(201).json(post);
    } catch (err) {
        console.error("POST/feed/upload error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;