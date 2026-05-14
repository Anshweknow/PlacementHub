const mongoose = require("mongoose");

const currencyRangeSchema = new mongoose.Schema(
  {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    display: { type: String, default: "Not disclosed" },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    name: { type: String, default: "PlacementHub Partner" },
    logo: { type: String, default: "" },
    website: { type: String, default: "" },
    about: { type: String, default: "A verified hiring partner on PlacementHub." },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, default: "Engineering" },
    description: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [] },
    skills: { type: [String], required: true, default: [] },
    eligibility: { type: String, default: "Open to eligible students based on company criteria." },
    assessmentDomain: { type: String, default: "General Aptitude" },
    autoGenerateQuiz: { type: Boolean, default: false },
    hiringStages: { type: [String], default: ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected"] },
    hiringProcess: { type: [String], default: ["Application review", "Technical round", "HR discussion"] },
    openings: { type: Number, default: 1 },
    location: { type: String, default: "Remote / On-site" },
    jobType: {
      type: String,
      enum: ["Internship", "Full-Time", "Remote", "Part-Time", "Contract"],
      default: "Full-Time",
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "0-1 Years", "1-3 Years", "3+ Years"],
      default: "Fresher",
    },
    salary: { type: String, default: "Not disclosed" },
    salaryRange: { type: currencyRangeSchema, default: () => ({}) },
    deadline: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    status: { type: String, enum: ["active", "paused", "closed", "draft"], default: "active" },
    company: { type: companySchema, default: () => ({}) },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", skills: "text", "company.name": "text" });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
