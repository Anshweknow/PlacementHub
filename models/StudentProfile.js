const mongoose = require("mongoose");

const TestResultSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: String,
    phone: String,
    college: String,
    branch: String,
    cgpa: String,
    twelfthMarks: String,
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: String,
    resumeOriginalName: String,
    testHistory: {
      type: [TestResultSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
