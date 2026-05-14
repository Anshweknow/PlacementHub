const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    title: { type: String, default: "Talent Acquisition Lead" },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
    },
    permissions: { type: [String], default: ["jobs", "candidates", "analytics", "offers"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruiter", recruiterSchema);
