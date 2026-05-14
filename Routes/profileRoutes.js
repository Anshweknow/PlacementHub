const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const uploadBasic = require("../middleware/basicMulter");
const { updateProfile, getProfile, getProfileById, matchCandidates, addTestResult, getTestHistory, uploadResume, uploadPhoto } = require("../controllers/profileController");

router.get("/", auth, getProfile);
router.put("/", auth, updateProfile);
router.get("/match-candidates/:jobId", auth, matchCandidates);
router.get("/me", auth, getProfile);
router.get("/test-history", auth, getTestHistory);
router.post("/test-result", auth, addTestResult);
router.post("/upload-resume", auth, uploadBasic.single("resume"), uploadResume);
router.post("/upload-photo", auth, uploadBasic.single("photo"), uploadPhoto);
router.post("/update", auth, uploadBasic.single("resume"), updateProfile);
router.get("/:id", auth, getProfileById);

module.exports = router;
