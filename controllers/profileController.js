const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Job = require("../models/job");

const normalizeSkills = (skills = "") => {
  if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).filter(Boolean);
  return String(skills).split(",").map((s) => s.trim()).filter(Boolean);
};

const parseJsonArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_err) {
    return fallback;
  }
};

const computeProfileInsights = (profile = {}) => {
  const sections = [
    { key: "personal information", complete: Boolean(profile.fullName && profile.phone && profile.location) },
    { key: "education", complete: Boolean((profile.education || []).length || profile.college) },
    { key: "skills", complete: Boolean((profile.skills || []).length >= 3) },
    { key: "projects", complete: Boolean((profile.projects || []).length) },
    { key: "experience", complete: Boolean((profile.experience || []).length) },
    { key: "certifications", complete: Boolean((profile.certifications || []).length) },
    { key: "resume", complete: Boolean(profile.resumeUrl) },
    { key: "social links", complete: Boolean(profile.socialLinks?.linkedin || profile.socialLinks?.github || profile.socialLinks?.portfolio) },
  ];

  const completed = sections.filter((section) => section.complete).length;
  const completion = Math.round((completed / sections.length) * 100);
  const missingSections = sections.filter((section) => !section.complete).map((section) => section.key);
  const suggestions = [
    ...(missingSections.includes("resume") ? ["Upload a tailored PDF resume for faster recruiter screening."] : []),
    ...(missingSections.includes("projects") ? ["Add 1-2 measurable projects with technologies and links."] : []),
    ...(missingSections.includes("skills") ? ["List at least five role-relevant technical skills."] : []),
    ...(missingSections.includes("social links") ? ["Connect LinkedIn, GitHub, or portfolio links to improve trust."] : []),
  ];
  const atsScore = Math.min(98, Math.max(25, completion + Math.min((profile.skills || []).length, 12) * 2 + (profile.resumeUrl ? 8 : 0)));

  return { completion, missingSections, suggestions, atsScore };
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    let profile = await StudentProfile.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!profile) profile = await StudentProfile.create({ userId: req.user.userId, fullName: user.fullName });
    const insights = computeProfileInsights(profile.toObject());

    if (profile.completion !== insights.completion || profile.atsScore !== insights.atsScore) {
      profile.completion = insights.completion;
      profile.atsScore = insights.atsScore;
      await profile.save();
    }

    return res.json({ user, profile: profile.toObject(), insights });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const update = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      headline: req.body.headline,
      location: req.body.location,
      college: req.body.college,
      branch: req.body.branch,
      cgpa: req.body.cgpa,
      twelfthMarks: req.body.twelfthMarks,
      skills: normalizeSkills(req.body.skills),
      education: parseJsonArray(req.body.education),
      projects: parseJsonArray(req.body.projects),
      experience: parseJsonArray(req.body.experience),
      certifications: parseJsonArray(req.body.certifications),
      socialLinks: {
        linkedin: req.body.linkedin || req.body["socialLinks.linkedin"] || "",
        github: req.body.github || req.body["socialLinks.github"] || "",
        portfolio: req.body.portfolio || req.body["socialLinks.portfolio"] || "",
      },
    };

    if (req.file) {
      update.resumeUrl = `/uploads/${req.file.filename}`;
      update.resumeOriginalName = req.file.originalname;
      update.parsedResumeSkills = normalizeSkills(`${req.body.skills || ""}, JavaScript, Communication`).slice(0, 12);
    }

    const cleanedUpdate = Object.fromEntries(Object.entries(update).filter(([, value]) => value !== undefined));
    const preliminary = await StudentProfile.findOneAndUpdate({ userId }, { $set: cleanedUpdate }, { upsert: true, new: true });
    const insights = computeProfileInsights(preliminary.toObject());
    preliminary.completion = insights.completion;
    preliminary.atsScore = insights.atsScore;
    await preliminary.save();

    if (req.body.fullName) await User.findByIdAndUpdate(userId, { $set: { fullName: req.body.fullName } });
    return res.json({ msg: "Profile updated successfully", profile: preliminary, insights });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "Resume PDF is required" });
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $set: {
          resumeUrl: `/uploads/${req.file.filename}`,
          resumeOriginalName: req.file.originalname,
          parsedResumeSkills: normalizeSkills(req.body.skills || "JavaScript, React, Node.js, MongoDB"),
        },
      },
      { upsert: true, new: true }
    );
    const insights = computeProfileInsights(profile.toObject());
    profile.completion = insights.completion;
    profile.atsScore = insights.atsScore;
    await profile.save();
    return res.json({ msg: "Resume uploaded successfully", profile, insights });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "Profile photo is required" });
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { photoUrl: `/uploads/${req.file.filename}` } },
      { upsert: true, new: true }
    );
    return res.json({ msg: "Profile photo uploaded successfully", profile });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.addTestResult = async (req, res) => {
  try {
    const { category, score, total } = req.body;
    if (!category || score === undefined || total === undefined) {
      return res.status(400).json({ msg: "category, score and total are required" });
    }
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $push: { testHistory: { category, score, total, date: new Date() } } },
      { new: true, upsert: true }
    );
    return res.json({ msg: "Test result saved", testHistory: profile.testHistory });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getTestHistory = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.userId }).select("testHistory");
    return res.json({ testHistory: profile?.testHistory || [] });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const profile = await StudentProfile.findOne({ userId: req.params.id });
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ user, profile: profile || {}, insights: computeProfileInsights(profile?.toObject?.() || {}) });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.matchCandidates = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const profiles = await StudentProfile.find({ skills: { $in: job.skills || [] } }).populate("userId", "fullName email");
    const normalizedJobSkills = (job.skills || []).map((s) => s.toLowerCase());
    const candidates = profiles.map((profile) => {
      const profileSkills = (profile.skills || []).map((s) => s.toLowerCase());
      const common = profileSkills.filter((s) => normalizedJobSkills.includes(s));
      return { user: profile.userId, profile, matchPercent: normalizedJobSkills.length ? Math.round((common.length / normalizedJobSkills.length) * 100) : 0 };
    }).sort((a, b) => b.matchPercent - a.matchPercent);

    return res.json(candidates);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
