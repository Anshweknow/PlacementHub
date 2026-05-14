const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createJob, getJobsWithApplyStatus, getJobById, getJobCount, applyToJobByParam, toggleSaveJob } = require("../controllers/jobController");

router.get("/", auth, getJobsWithApplyStatus);
router.get("/all", auth, getJobsWithApplyStatus);
router.get("/count", getJobCount);
router.post("/create", auth, createJob);
router.get("/:id", auth, getJobById);
router.post("/:id/apply", auth, applyToJobByParam);
router.post("/:id/save", auth, toggleSaveJob);

module.exports = router;
