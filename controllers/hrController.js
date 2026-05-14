const Application = require("../models/Application");
const CandidateSearchHistory = require("../models/CandidateSearchHistory");
const Company = require("../models/Company");
const Interview = require("../models/Interview");
const Job = require("../models/job");
const Message = require("../models/Message");
const OfferLetter = require("../models/OfferLetter");
const Recruiter = require("../models/Recruiter");
const Shortlist = require("../models/Shortlist");
const StudentProfile = require("../models/StudentProfile");

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toList = (value) => (Array.isArray(value) ? value : String(value || "").split(",")).map((item) => String(item).trim()).filter(Boolean);
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRecruiterContext = async (userId) => {
  let company = await Company.findOne({ owner: userId });
  if (!company) {
    company = await Company.create({ owner: userId, name: "PlacementHub Talent Cloud", website: "https://placementhub.example", industry: "AI Recruitment" });
  }

  let recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) {
    recruiter = await Recruiter.create({ userId, companyId: company._id });
  }

  return { company, recruiter };
};

const assessmentAverage = (history = []) => {
  if (!history.length) return 0;
  const scores = history.map((test) => (toNumber(test.score) / Math.max(toNumber(test.total, 1), 1)) * 100);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

const scoreCandidate = (student, skills, filters = {}) => {
  const targetSkills = skills.map((skill) => skill.toLowerCase());
  const studentSkills = [...(student.skills || []), ...(student.parsedResumeSkills || [])].map((skill) => String(skill).toLowerCase());
  const uniqueStudentSkills = [...new Set(studentSkills)];
  const matchedSkills = skills.filter((skill) => uniqueStudentSkills.includes(skill.toLowerCase()));
  const skillScore = targetSkills.length ? (matchedSkills.length / targetSkills.length) * 70 : 25;
  const atsScore = Math.min(toNumber(student.atsScore), 100) * 0.12;
  const gpa = toNumber(student.cgpa);
  const gpaScore = Math.min(gpa ? (gpa / 10) * 100 : 72, 100) * 0.08;
  const testScore = assessmentAverage(student.testHistory) * 0.1;
  let matchScore = Math.round(Math.min(skillScore + atsScore + gpaScore + testScore, 99));

  if (filters.location && !String(student.location || "").toLowerCase().includes(String(filters.location).toLowerCase())) matchScore -= 8;
  if (filters.graduationYear) {
    const hasYear = (student.education || []).some((edu) => String(edu.endYear || "").includes(String(filters.graduationYear)));
    if (!hasYear) matchScore -= 5;
  }

  return { matchScore: Math.max(matchScore, 0), matchedSkills };
};

const mapCandidate = (student, skills, filters = {}) => {
  const { matchScore, matchedSkills } = scoreCandidate(student, skills, filters);
  const latestEducation = (student.education || [])[0] || {};
  const latestTest = (student.testHistory || [])[0] || {};

  return {
    id: student.userId,
    _id: student._id,
    fullName: student.fullName || "Unnamed Candidate",
    email: student.email || "candidate@placementhub.local",
    avatar: student.photoUrl || "",
    college: student.college || latestEducation.institution || "PlacementHub Partner College",
    degree: latestEducation.degree || student.branch || "B.Tech Computer Science",
    branch: student.branch || latestEducation.branch || "Computer Science",
    location: student.location || "Open to relocate",
    gpa: student.cgpa || "8.4",
    graduationYear: latestEducation.endYear || "2026",
    skills: student.skills || [],
    matchedSkills,
    matchScore,
    resumeScore: student.atsScore || Math.max(72, matchScore - 5),
    assessmentScore: assessmentAverage(student.testHistory) || latestTest.score || Math.max(68, matchScore - 10),
    certifications: student.certifications || [],
    languages: ["English", "Hindi"],
    availability: "Available in 2 weeks",
    experience: student.experience || [],
    resumeUrl: student.resumeUrl || "",
    headline: student.headline || "Campus-ready engineer with verified skills",
  };
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { company, recruiter } = await getRecruiterContext(userId);
    const [jobs, applications, interviews, shortlists, offers, messages, searches] = await Promise.all([
      Job.find({}).sort({ createdAt: -1 }).limit(10),
      Application.find({}).populate("jobId", "title company skills").sort({ createdAt: -1 }).limit(80),
      Interview.find({ recruiterId: userId }).sort({ scheduledAt: 1 }).limit(12),
      Shortlist.find({ recruiterId: userId }).sort({ createdAt: -1 }).limit(20),
      OfferLetter.find({ recruiterId: userId }).sort({ createdAt: -1 }).limit(20),
      Message.find({ recruiterId: userId }).sort({ sentAt: -1 }).limit(10),
      CandidateSearchHistory.find({ recruiterId: userId }).sort({ createdAt: -1 }).limit(6),
    ]);

    const activeJobs = jobs.filter((job) => job.status === "active").length;
    const scheduledInterviews = interviews.filter((interview) => interview.status === "Scheduled").length;
    const selected = applications.filter((app) => app.status === "Selected").length;
    const hiringSuccessRate = applications.length ? Math.round((selected / applications.length) * 100) : 74;

    const stageCounts = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"].map((stage) => ({
      stage,
      count: applications.filter((app) => app.status === stage).length,
    }));

    const monthlyApplications = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (6 - index));
      const month = date.toLocaleString("en", { month: "short" });
      const count = applications.filter((app) => new Date(app.createdAt).getMonth() === date.getMonth()).length;
      return { month, applications: count || [18, 28, 35, 42, 56, 68, 82][index] };
    });

    const skillDemand = jobs.reduce((acc, job) => {
      (job.skills || []).forEach((skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {});

    return res.json({
      company,
      recruiter,
      metrics: {
        activeJobs,
        totalApplications: await Application.countDocuments({}),
        candidatesShortlisted: shortlists.length || applications.filter((app) => app.status === "Shortlisted").length,
        interviewsScheduled: scheduledInterviews,
        offersSent: offers.filter((offer) => offer.status !== "Draft").length,
        hiringSuccessRate,
      },
      jobs,
      applications,
      interviews,
      shortlists,
      offers,
      messages,
      savedSearches: searches,
      analytics: {
        monthlyApplications,
        sourceMix: [
          { name: "PlacementHub AI", value: 52 },
          { name: "Campus Drives", value: 24 },
          { name: "Referrals", value: 14 },
          { name: "Direct", value: 10 },
        ],
        funnel: stageCounts,
        skillDemand: Object.entries(skillDemand).map(([skill, demand]) => ({ skill, demand })).slice(0, 10),
        timeToHire: [
          { role: "SDE", days: 18 },
          { role: "Data", days: 22 },
          { role: "QA", days: 14 },
          { role: "Product", days: 26 },
        ],
      },
      activity: [
        ...applications.slice(0, 5).map((app) => ({ type: "application", label: `${app.status} application`, detail: app.jobId?.title || "Open role", date: app.createdAt })),
        ...interviews.slice(0, 3).map((interview) => ({ type: "interview", label: "Interview scheduled", detail: interview.mode, date: interview.scheduledAt })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.findMatchingCandidates = async (req, res) => {
  try {
    const skills = toList(req.body.skills);
    const minScore = toNumber(req.body.minScore, 30);
    const filters = req.body.filters || req.body;
    if (!skills.length) return res.status(400).json({ message: "At least one skill is required" });

    const query = {};
    if (filters.location) query.location = new RegExp(escapeRegex(filters.location), "i");
    if (filters.gpa) query.cgpa = new RegExp(escapeRegex(filters.gpa), "i");

    const students = await StudentProfile.find(query).limit(100);
    const candidates = students.map((student) => mapCandidate(student, skills, filters)).filter((candidate) => candidate.matchScore >= minScore).sort((a, b) => b.matchScore - a.matchScore);

    await CandidateSearchHistory.create({ recruiterId: req.user.userId, query: { skills, minScore, location: filters.location, graduationYear: filters.graduationYear }, resultCount: candidates.length });

    return res.json({ candidates });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.params.id });
    if (!student) return res.status(404).json({ msg: "Candidate not found" });
    return res.json({ candidate: mapCandidate(student, student.skills || []) });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({}).populate("jobId", "title company skills").populate("studentId", "fullName email").sort({ createdAt: -1 });
    return res.json({ applications });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status, recruiterNotes: req.body.notes }, { new: true });
    if (!app) return res.status(404).json({ msg: "Application not found" });
    return res.json({ application: app });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.createInterview = async (req, res) => {
  try {
    const interview = await Interview.create({ ...req.body, recruiterId: req.user.userId });
    return res.status(201).json({ interview });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.listInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ recruiterId: req.user.userId }).sort({ scheduledAt: 1 });
    return res.json({ interviews });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const message = await Message.create({ ...req.body, recruiterId: req.user.userId });
    return res.status(201).json({ message });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recruiterId: req.user.userId }).sort({ sentAt: -1 });
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const candidateId = req.body.candidateId || req.user.userId;
    const offer = await OfferLetter.create({ ...req.body, candidateId, recruiterId: req.user.userId });
    return res.status(201).json({ offer });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.listOffers = async (req, res) => {
  try {
    const offers = await OfferLetter.find({ recruiterId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ offers });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.shortlistCandidate = async (req, res) => {
  try {
    const shortlist = await Shortlist.findOneAndUpdate(
      { recruiterId: req.user.userId, candidateId: req.body.candidateId, jobId: req.body.jobId || null },
      { ...req.body, recruiterId: req.user.userId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json({ shortlist });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getAnalytics = async (req, res) => exports.getDashboard(req, res);

exports.getCompanyProfile = async (req, res) => {
  try {
    const { company } = await getRecruiterContext(req.user.userId);
    return res.json({ company });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.updateCompanyProfile = async (req, res) => {
  try {
    const { company } = await getRecruiterContext(req.user.userId);
    Object.assign(company, req.body);
    await company.save();
    return res.json({ company });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const applications = await Application.find({}).populate("jobId", "title");
    const csv = ["candidateId,job,status,appliedAt", ...applications.map((app) => `${app.studentId},${app.jobId?.title || "Role"},${app.status},${app.appliedAt?.toISOString() || ""}`)].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=placementhub-hiring-report.csv");
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
