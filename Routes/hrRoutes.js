const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const hrController = require("../controllers/hrController");

// Match candidates based on skills
router.post("/match", auth, hrController.findMatchingCandidates);

module.exports = router;
