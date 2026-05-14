const mongoose = require("mongoose");

const offerLetterSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidateName: { type: String, required: true },
    role: { type: String, required: true },
    salary: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    template: { type: String, default: "Campus Graduate Offer" },
    status: { type: String, enum: ["Draft", "Sent", "Accepted", "Declined"], default: "Draft" },
    exportedFormats: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfferLetter", offerLetterSchema);
