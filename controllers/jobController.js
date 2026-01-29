const Job = require("../models/job");
const Application = require("../models/Application");

/* ===========================
   CREATE JOB (HR ONLY)
=========================== */
exports.createJob = async (req, res) => {
  try {
    const { title, description, skills, salary } = req.body;

    if (!title || !description || !skills?.length) {
      return res.status(400).json({ msg: "Required fields missing" });
    }

    // Only HR can post
    if (req.user.role !== "hr") {
      return res.status(403).json({ msg: "Only HR can post jobs" });
    }

    const job = new Job({
      title,
      description,
      skills,
      salary,
      postedBy: req.user.userId
    });

    await job.save();

    res.json({
      msg: "Job posted successfully",
      job
    });

  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message
    });
  }
};

/* ===========================
   GET JOBS WITH APPLY STATUS
=========================== */
exports.getJobsWithApplyStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const jobs = await Job.find().sort({ createdAt: -1 });

    const applied = await Application.find({
      studentId: userId
    }).select("jobId");

    const appliedJobIds = applied.map(a => a.jobId.toString());

    const finalJobs = jobs.map(job => ({
      ...job.toObject(),
      applied: appliedJobIds.includes(job._id.toString())
    }));

    res.json(finalJobs);

  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* ===========================
   GET SINGLE JOB
=========================== */
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    res.json(job);

  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* ===========================
   JOB COUNT
=========================== */
exports.getJobCount = async (req, res) => {
  try {
    const count = await Job.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};