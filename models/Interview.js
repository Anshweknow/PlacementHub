const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    mode: { type: String, enum: ["Google Meet", "Zoom", "Microsoft Teams", "On-site"], default: "Google Meet" },
    meetingLink: { type: String, default: "" },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled", "No Show"], default: "Scheduled" },
    feedback: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

interviewSchema.index({ recruiterId: 1, scheduledAt: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
