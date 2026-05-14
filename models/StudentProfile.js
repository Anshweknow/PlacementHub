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

const educationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: String,
    branch: String,
    startYear: String,
    endYear: String,
    score: String,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    technologies: [String],
    link: String,
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    role: String,
    company: String,
    duration: String,
    description: String,
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    title: String,
    issuer: String,
    year: String,
    link: String,
  },
  { _id: false }
);

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: String,
    phone: String,
    headline: String,
    location: String,
    college: String,
    branch: String,
    cgpa: String,
    twelfthMarks: String,
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    photoUrl: String,
    resumeUrl: String,
    resumeOriginalName: String,
    parsedResumeSkills: { type: [String], default: [] },
    atsScore: { type: Number, default: 0 },
    completion: { type: Number, default: 0 },
    testHistory: { type: [TestResultSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
