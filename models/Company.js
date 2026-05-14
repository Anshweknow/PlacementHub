const mongoose = require("mongoose");

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    github: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, default: "PlacementHub Partner" },
    logo: { type: String, default: "" },
    about: { type: String, default: "A verified hiring partner using PlacementHub to hire campus talent." },
    industry: { type: String, default: "Technology" },
    website: { type: String, default: "" },
    location: { type: String, default: "Remote / India" },
    size: { type: String, default: "201-500 employees" },
    cultureImages: { type: [String], default: [] },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

companySchema.index({ owner: 1 });
companySchema.index({ name: "text", industry: "text" });

module.exports = mongoose.model("Company", companySchema);
