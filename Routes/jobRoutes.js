const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createJob, updateJob, deleteJob, changeJobStatus, getJobsWithApplyStatus, getJobById, getJobCount, applyToJobByParam, toggleSaveJob } = require("../controllers/jobController");

router.get("/", auth, getJobsWithApplyStatus);
router.get("/all", auth, getJobsWithApplyStatus);
router.get("/count", getJobCount);
router.post("/", auth, createJob);
router.post("/create", auth, createJob);
router.get("/:id", auth, getJobById);
router.put("/:id", auth, updateJob);
router.delete("/:id", auth, deleteJob);
router.patch("/:id/status", auth, changeJobStatus);
router.post("/:id/apply", auth, applyToJobByParam);
router.post("/:id/save", auth, toggleSaveJob);

module.exports = router;
