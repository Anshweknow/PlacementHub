const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");

const jobPopulate = {
  path: "jobId",
  select: "title salary salaryRange skills location jobType experienceLevel deadline company postedBy",
  populate: { path: "postedBy", select: "fullName email" },
};

exports.applyToJob = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { jobId } = req.body;

    const existingApp = await Application.findOne({ studentId, jobId });
    if (existingApp) return res.status(400).json({ msg: "Already applied to this job" });

    const profile = await StudentProfile.findOne({ userId: studentId }).select("resumeUrl");
    const application = await Application.create({ studentId, jobId, resumeUrl: profile?.resumeUrl || "" });

    return res.status(201).json({ msg: "Application submitted successfully", application });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: "Already applied to this job" });
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    if (req.user.role === "hr") return exports.getAllApplicationsForHR(req, res);
    const { status = "all" } = req.query;
    const filter = { studentId: req.user.userId };

    if (status === "active") filter.status = { $in: ["Applied", "Under Review", "Shortlisted", "Interview Scheduled"] };
    else if (status === "interviews") filter.status = "Interview Scheduled";
    else if (status !== "all") filter.status = new RegExp(`^${status}$`, "i");

    const apps = await Application.find(filter).populate(jobPopulate).sort({ createdAt: -1 });
    const allApps = await Application.find({ studentId: req.user.userId }).select("status");
    const total = allApps.length;
    const selected = allApps.filter((app) => app.status === "Selected").length;
    const stats = {
      totalApplications: total,
      shortlistedCount: allApps.filter((app) => ["Shortlisted", "Interview Scheduled", "Selected"].includes(app.status)).length,
      interviewCount: allApps.filter((app) => app.status === "Interview Scheduled").length,
      offersReceived: selected,
      successRate: total ? Math.round((selected / total) * 100) : 0,
    };

    return res.json({ applications: apps, stats });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, studentId: req.user.userId }).populate(jobPopulate);
    if (!app) return res.status(404).json({ msg: "Application not found" });
    return res.json(app);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, studentId: req.user.userId });
    if (!app) return res.status(404).json({ msg: "Application not found" });
    if (!app.withdrawAllowed || ["Selected", "Rejected", "Withdrawn"].includes(app.status)) {
      return res.status(400).json({ msg: "This application can no longer be withdrawn" });
    }

    app.status = "Withdrawn";
    app.timeline.push({ stage: "Withdrawn", note: "Application withdrawn by student" });
    await app.save();
    return res.json({ msg: "Application withdrawn successfully", application: app });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getAllApplicationsForHR = async (req, res) => {
  try {
    const apps = await Application.find().populate("studentId", "fullName email").populate(jobPopulate).sort({ createdAt: -1 });
    return res.json(apps.map((app) => ({ _id: app._id, student: app.studentId, job: app.jobId, status: app.status, createdAt: app.createdAt })));
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getTotalApplications = async (req, res) => {
  try {
    const count = await Application.countDocuments();
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.getWeeklyApplications = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const count = await Application.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};
