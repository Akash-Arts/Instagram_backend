import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        avatar: { type: String, default: "" },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        wallet_coins: { type: Number, default: 0 },
        wallet_rupees: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export default model("User", userSchema);