import { Schema, model } from "mongoose";

const walletTransactionSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rupees: { type: Number, required: true },
        type: { type: String, enum: ["payment under process", "payment approved"], required: true },
        meta: { type: Object },
    },
    { timestamps: true }
);

export default model("WalletTransaction", walletTransactionSchema);