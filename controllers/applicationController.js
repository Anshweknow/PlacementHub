const Application = require("../models/Application");

/* =========================================
   1️⃣ STUDENT — APPLY TO JOB
========================================= */
exports.applyToJob = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { jobId } = req.body;

    const existingApp = await Application.findOne({ studentId, jobId });
    if (existingApp) {
      return res.status(400).json({ msg: "Already applied to this job" });
    }

    const application = new Application({
      studentId,
      jobId,
    });

    await application.save();

    res.json({ msg: "Application submitted successfully", application });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* =========================================
   2️⃣ STUDENT — GET MY APPLICATIONS
========================================= */
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ studentId: req.user.userId })
      .populate("jobId", "jobTitle companyName salaryRange");

    res.json(apps);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

/* =========================================
   3️⃣ HR — GET ALL APPLICATIONS
========================================= */
exports.getAllApplicationsForHR = async (req, res) => {
  try {
    const apps = await Application.find()
      .populate("studentId", "name email")
      .populate("jobId", "jobTitle companyName salaryRange");

    const result = apps.map((app) => ({
      _id: app._id,
      student: app.studentId,
      job: app.jobId,
      createdAt: app.createdAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* =========================================
   APPLICATION STATISTICS
========================================= */

// ⭐ Total applications count
exports.getTotalApplications = async (req, res) => {
  try {
    const count = await Application.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ⭐ Weekly applications (past 7 days)
exports.getWeeklyApplications = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const count = await Application.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
