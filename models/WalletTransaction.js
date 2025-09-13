// models/WalletTransaction.js
const { Schema, model } = require("mongoose");

const walletTransactionSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        coins: { type: Number, required: true },
        type: { type: String, enum: ["earn", "payout"], required: true },
        meta: { type: Object },
    },
    { timestamps: true }
);

module.exports = model("WalletTransaction", walletTransactionSchema);
