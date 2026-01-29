const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fullName: String,
    phone: String,
    college: String,

    // NEW fields
    branch: String,
    cgpa: String,
    twelfthMarks: String,

    // Skills should allow array OR string
    skills: {
        type: [String],
        default: []
    },

    resumeUrl: String
});

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
