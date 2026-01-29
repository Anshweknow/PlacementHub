const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  updateProfile,
  getProfile,
  getProfileById,
  matchCandidates,
} = require("../controllers/profileController");

// upload middlewares
const uploadCloud = require("../middleware/uploadResume");
const uploadBasic = require("../middleware/basicMulter");

const StudentProfile = require("../models/StudentProfile");

/* ===============================
   MATCH CANDIDATES (HR)
   GET /api/profile/match-candidates/:jobId
================================ */
router.get("/match-candidates/:jobId", auth, matchCandidates);

/* ===============================
   STUDENT — GET OWN PROFILE
   GET /api/profile/me
================================ */
// MUST be defined BEFORE /:id
router.get("/me", auth, getProfile);

/* ===============================
   HR — VIEW STUDENT PROFILE
   GET /api/profile/:id
================================ */
router.get("/:id", auth, getProfileById);

/* ===============================
   UPDATE PROFILE
   POST /api/profile/update
================================ */
router.post(
  "/update",
  auth,
  uploadBasic.single("resume"),
  updateProfile
);

/* ===============================
   UPLOAD RESUME (CLOUDINARY)
   POST /api/profile/resume
================================ */
router.post(
  "/resume",
  auth,
  uploadCloud.single("resume"),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      const profile = await StudentProfile.findOneAndUpdate(
        { userId },
        { resumeUrl: req.file.path },
        { new: true, upsert: true }
      );

      res.json({
        msg: "Resume uploaded successfully",
        resumeUrl: req.file.path,
        profile,
      });
    } catch (err) {
      console.error("Resume upload error:", err);
      res.status(500).json({
        msg: "Server error",
        error: err.message,
      });
    }
  }
);

module.exports = router;