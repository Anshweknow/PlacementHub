const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { applyToJob, getMyApplications, getApplicationById, withdrawApplication, getAllApplicationsForHR, getTotalApplications, getWeeklyApplications } = require("../controllers/applicationController");
const hrController = require("../controllers/hrController");

router.post("/apply", auth, applyToJob);
router.get("/", auth, getMyApplications);
router.get("/my", auth, getMyApplications);
router.get("/all", auth, getAllApplicationsForHR);
router.get("/count", auth, getTotalApplications);
router.get("/weekly", auth, getWeeklyApplications);
router.patch("/:id", auth, hrController.updateApplication);
router.get("/:id", auth, getApplicationById);
router.delete("/:id", auth, withdrawApplication);

module.exports = router;
