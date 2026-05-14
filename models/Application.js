const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    stage: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected", "Withdrawn"],
      default: "Applied",
    },
    recruiterNotes: { type: String, default: "Your application has been received by the recruiting team." },
    interviewDate: { type: Date },
    resumeUrl: { type: String, default: "" },
    timeline: { type: [timelineSchema], default: () => [{ stage: "Applied", note: "Application submitted" }] },
    appliedAt: { type: Date, default: Date.now },
    withdrawAllowed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ApplicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
ApplicationSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model("Application", ApplicationSchema);
