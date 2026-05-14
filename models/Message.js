const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject: { type: String, default: "PlacementHub update" },
    body: { type: String, required: true },
    channel: { type: String, enum: ["email", "in-app", "bulk"], default: "in-app" },
    status: { type: String, enum: ["Draft", "Sent", "Read"], default: "Sent" },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

messageSchema.index({ recruiterId: 1, sentAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
