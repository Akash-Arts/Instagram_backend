import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Post from "../models/Post.js";
import postData from "./DummyData.js";

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");

        // clear collections
        await User.deleteMany();
        await Post.deleteMany();

        // check counts
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();

        let users = [];
        if (userCount === 0) {
            users = await User.insertMany([
                { name: "Akash", email: "akash@gmail.com", password: await bcrypt.hash("123456", 10) },
                { name: "John", email: "john@gmail.com", password: await bcrypt.hash("123456", 10) },
                { name: "Emma", email: "emma@gmail.com", password: await bcrypt.hash("123456", 10) },
                { name: "Alice", email: "alice@gmail.com", password: await bcrypt.hash("123456", 10) },
                { name: "Bob", email: "bob@gmail.com", password: await bcrypt.hash("123456", 10) },
            ]);
            console.log(`👤 Inserted ${users.length} users`);
        } else {
            users = await User.find();
        }

        if (postCount === 0) {
            const posts = await Post.insertMany(
                postData.map((p, i) => ({
                    creator_id: users[i % users.length]._id,
                    type: p.type,
                    url: p.url,
                    content: p.content || "",
                    comments: (p.comments || []).map(c => ({
                        userId: users.find(u => u.name === c.username)?._id || users[0]._id,
                        username: c.username,
                        text: c.text,
                        createdAt: new Date()
                    })),
                    likedBy: [],
                    savedBy: [],
                    viewedBy: [],
                }))
            );
            console.log(`📝 Inserted ${posts.length} posts`);
        }

        console.log("🌱 Database seeded successfully!");
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase();
}

export default seedDatabase;