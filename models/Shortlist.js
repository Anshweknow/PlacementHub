const mongoose = require("mongoose");

const shortlistSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    matchScore: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

shortlistSchema.index({ recruiterId: 1, candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Shortlist", shortlistSchema);
