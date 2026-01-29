const express = require("express");
const router = express.Router();


const auth = require("../middleware/authMiddleware");
const {
createJob,
getJobsWithApplyStatus,
getJobById,
getJobCount
} = require("../controllers/jobController");


// =====================
// JOB ROUTES
// =====================


// Get all jobs (student view with apply status)
router.get("/all", auth, getJobsWithApplyStatus);


// Get total job count (dashboard stats)
router.get("/count", getJobCount);


// Create job (HR only)
router.post("/create", auth, createJob);


// Get single job by ID
router.get("/:id", getJobById);


module.exports = router;