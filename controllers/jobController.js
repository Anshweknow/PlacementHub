const Job = require("../models/job");
const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
};

const parseSalaryNumber = (value) => {
  const numeric = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const buildJobPayload = (body, userId) => {
  const skills = parseList(body.skills);
  const salaryMin = body.salaryMin ?? body["salaryRange.min"];
  const salaryMax = body.salaryMax ?? body["salaryRange.max"];

  return {
    title: body.title,
    department: body.department,
    description: body.description,
    responsibilities: parseList(body.responsibilities),
    qualifications: parseList(body.qualifications),
    preferredSkills: parseList(body.preferredSkills),
    requiredSkills: parseList(body.requiredSkills).length ? parseList(body.requiredSkills) : skills,
    skills,
    eligibility: body.eligibility,
    assessmentDomain: body.assessmentDomain,
    autoGenerateQuiz: Boolean(body.autoGenerateQuiz),
    hiringStages: parseList(body.hiringStages),
    hiringProcess: parseList(body.hiringProcess),
    openings: body.openings,
    location: body.location,
    jobType: body.jobType,
    experienceLevel: body.experienceLevel,
    salary: body.salary,
    salaryRange: {
      min: salaryMin !== undefined ? parseSalaryNumber(salaryMin) : parseSalaryNumber(body.salary),
      max: salaryMax !== undefined ? parseSalaryNumber(salaryMax) : parseSalaryNumber(body.salary),
      display: body.salary || "Not disclosed",
    },
    deadline: body.deadline,
    status: body.status || "active",
    company: {
      name: body.companyName || body.company?.name,
      logo: body.companyLogo || body.company?.logo,
      website: body.companyWebsite || body.company?.website,
      about: body.companyAbout || body.company?.about,
    },
    postedBy: userId,
  };
};

const decorateJobsForStudent = async (jobs, userId) => {
  if (!userId) return jobs.map((job) => job.toObject());

  const [applications, profile] = await Promise.all([
    Application.find({ studentId: userId, jobId: { $in: jobs.map((job) => job._id) } }).select("jobId status"),
    StudentProfile.findOne({ userId }).select("skills"),
  ]);

  const applicationByJob = new Map(applications.map((app) => [String(app.jobId), app.status]));
  const profileSkills = new Set((profile?.skills || []).map((skill) => skill.toLowerCase()));

  return jobs.map((job) => {
    const normalizedSkills = (job.skills || []).map((skill) => String(skill).toLowerCase());
    const matches = normalizedSkills.filter((skill) => profileSkills.has(skill)).length;
    const relevance = normalizedSkills.length ? Math.round((matches / normalizedSkills.length) * 100) : 0;

    return {
      ...job.toObject(),
      applied: applicationByJob.has(String(job._id)),
      applicationStatus: applicationByJob.get(String(job._id)) || null,
      saved: (job.savedBy || []).some((id) => String(id) === String(userId)),
      relevance,
    };
  });
};

exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "hr") return res.status(403).json({ msg: "Only HR can post jobs" });

    const payload = buildJobPayload(req.body, req.user.userId);
    if (!payload.title || !payload.description || !payload.skills.length) {
      return res.status(400).json({ msg: "Title, description and skills are required" });
    }

    const job = await Job.create(payload);
    return res.status(201).json({ msg: "Job posted successfully", job });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getJobsWithApplyStatus = async (req, res) => {
  try {
    const {
      search = "",
      location,
      salaryMin,
      salaryMax,
      experienceLevel,
      jobType,
      skills,
      sort = "latest",
      page = 1,
      limit = 9,
    } = req.query;

    const filter = { status: "active" };
    if (search) {
      const pattern = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: pattern }, { "company.name": pattern }, { skills: pattern }, { description: pattern }];
    }
    if (location) filter.location = new RegExp(String(location), "i");
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (jobType) filter.jobType = jobType;
    const skillList = parseList(skills);
    if (skillList.length) filter.skills = { $in: skillList.map((skill) => new RegExp(skill, "i")) };
    if (salaryMin || salaryMax) {
      filter["salaryRange.max"] = {};
      if (salaryMin) filter["salaryRange.max"].$gte = Number(salaryMin);
      if (salaryMax) filter["salaryRange.min"] = { $lte: Number(salaryMax) };
    }

    const sortMap = {
      latest: { createdAt: -1 },
      highestSalary: { "salaryRange.max": -1, createdAt: -1 },
      relevant: { createdAt: -1 },
    };

    const safeLimit = Math.min(Math.max(Number(limit) || 9, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [jobs, total] = await Promise.all([
      Job.find(filter).populate("postedBy", "fullName email").sort(sortMap[sort] || sortMap.latest).skip(skip).limit(safeLimit),
      Job.countDocuments(filter),
    ]);

    let decorated = await decorateJobsForStudent(jobs, req.user?.userId);
    if (sort === "relevant") decorated = decorated.sort((a, b) => b.relevance - a.relevance || new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ jobs: decorated, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) || 1 } });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "fullName email");
    if (!job) return res.status(404).json({ msg: "Job not found" });
    const [decorated] = await decorateJobsForStudent([job], req.user?.userId);
    return res.json(decorated || job);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.applyToJobByParam = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const job = await Job.findById(req.params.id);
    if (!job || job.status !== "active") return res.status(404).json({ msg: "Active job not found" });

    const existingApp = await Application.findOne({ studentId, jobId: job._id });
    if (existingApp) return res.status(400).json({ msg: "Already applied to this job", application: existingApp });

    const profile = await StudentProfile.findOne({ userId: studentId }).select("resumeUrl");
    const application = await Application.create({ studentId, jobId: job._id, resumeUrl: profile?.resumeUrl || "" });
    return res.status(201).json({ msg: "Application submitted successfully", application });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: "Already applied to this job" });
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.toggleSaveJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const alreadySaved = (job.savedBy || []).some((id) => String(id) === String(userId));
    const update = alreadySaved ? { $pull: { savedBy: userId } } : { $addToSet: { savedBy: userId } };
    await Job.findByIdAndUpdate(job._id, update);
    return res.json({ msg: alreadySaved ? "Job removed from favorites" : "Job saved", saved: !alreadySaved });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    if (req.user.role !== "hr") return res.status(403).json({ msg: "Only HR can update jobs" });
    const payload = buildJobPayload(req.body, req.user.userId);
    const job = await Job.findOneAndUpdate({ _id: req.params.id }, payload, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ msg: "Job not found" });
    return res.json({ msg: "Job updated successfully", job });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    if (req.user.role !== "hr") return res.status(403).json({ msg: "Only HR can delete jobs" });
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });
    await Application.deleteMany({ jobId: req.params.id });
    return res.json({ msg: "Job deleted successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.changeJobStatus = async (req, res) => {
  try {
    if (req.user.role !== "hr") return res.status(403).json({ msg: "Only HR can change job status" });
    const job = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!job) return res.status(404).json({ msg: "Job not found" });
    return res.json({ msg: "Job status updated", job });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getJobCount = async (req, res) => {
  try {
    const count = await Job.countDocuments({ status: "active" });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
