// models/Interaction.js
const { Schema, model } = require("mongoose");

const interactionSchema = new Schema(
    {
        post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["like", "comment", "share", "save", "view"], required: true },
        content: { type: String },
    },
    { timestamps: true }
);

module.exports = model("Interaction", interactionSchema);
