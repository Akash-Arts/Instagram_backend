// models/User.js
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        avatar: { type: String, default: "" },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        wallet_balance: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = model("User", userSchema);
