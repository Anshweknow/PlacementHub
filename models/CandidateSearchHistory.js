const mongoose = require("mongoose");

const candidateSearchHistorySchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    query: {
      skills: { type: [String], default: [] },
      minScore: { type: Number, default: 0 },
      location: { type: String, default: "" },
      graduationYear: { type: String, default: "" },
    },
    resultCount: { type: Number, default: 0 },
    saved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

candidateSearchHistorySchema.index({ recruiterId: 1, createdAt: -1 });

module.exports = mongoose.model("CandidateSearchHistory", candidateSearchHistorySchema);
