// db/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Post = require("../models/Post");
const postData = require("./DummyData");

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");

        // 👉 Check if users already exist
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log("⚡ Users already exist, skipping seeding...");
            return;
        }

        // 👉 Check if posts already exist
        const postCount = await Post.countDocuments();
        if (postCount > 0) {
            console.log("⚡ Posts already exist, skipping seeding...");
            return;
        }

        // 1️⃣ Insert Users
        const users = await User.insertMany([
            { name: "Akash", email: "akash@gmail.com", password: await bcrypt.hash("123456", 10) },
            { name: "John", email: "john@gmail.com", password: await bcrypt.hash("123456", 10) },
            { name: "Emma", email: "emma@gmail.com", password: await bcrypt.hash("123456", 10) },
            { name: "Alice", email: "alice@gmail.com", password: await bcrypt.hash("123456", 10) },
            { name: "Bob", email: "bob@gmail.com", password: await bcrypt.hash("123456", 10) },
        ]);
        console.log(`👤 Inserted ${users.length} users`);

        // 2️⃣ Insert Posts
        const posts = await Post.insertMany(
            postData.map((p, i) => {
                const comments = (p.comments || []).map((c) => {
                    const user = users.find(u => u.name === c.user);
                    return { user: user ? user._id : users[0]._id, text: c.text };
                });

                return {
                    creator_id: users[i % users.length]._id,
                    type: p.type,
                    url: p.url,
                    content: p.content || "",
                    allComments: comments,
                    likedBy: [],
                    savedBy: [],
                    viewedBy: [],
                };
            })
        );
        console.log(`📝 Inserted ${posts.length} posts`);

        console.log("🌱 Database seeded successfully!");
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
}

// Run seed if executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
