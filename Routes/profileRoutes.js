const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const uploadBasic = require("../middleware/basicMulter");

const {
  updateProfile,
  getProfile,
  getProfileById,
  matchCandidates,
  addTestResult,
  getTestHistory,
} = require("../controllers/profileController");

router.get("/match-candidates/:jobId", auth, matchCandidates);
router.get("/me", auth, getProfile);
router.get("/test-history", auth, getTestHistory);
router.post("/test-result", auth, addTestResult);
router.get("/:id", auth, getProfileById);
router.post("/update", auth, uploadBasic.single("resume"), updateProfile);

module.exports = router;
