const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  applyToJob,
  getMyApplications,
  getAllApplicationsForHR,
  getTotalApplications,
  getWeeklyApplications
} = require("../controllers/applicationController");

router.post("/apply", auth, applyToJob);
router.get("/my", auth, getMyApplications);
router.get("/all", auth, getAllApplicationsForHR);

// ⭐ NEW ROUTES FOR DASHBOARD ⭐
router.get("/count", auth, getTotalApplications);
router.get("/weekly", auth, getWeeklyApplications);

module.exports = router;
