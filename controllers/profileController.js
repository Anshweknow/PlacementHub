const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Job = require("../models/job");

const normalizeSkills = (skills = "") => {
  if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).filter(Boolean);
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    const profile = await StudentProfile.findOne({ userId: req.user.userId });

    if (!user) return res.status(404).json({ msg: "User not found" });

    return res.json({ user, profile: profile || {} });
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
      college: req.body.college,
      branch: req.body.branch,
      cgpa: req.body.cgpa,
      twelfthMarks: req.body.twelfthMarks,
      skills: normalizeSkills(req.body.skills),
    };

    if (req.file) {
      update.resumeUrl = `/uploads/${req.file.filename}`;
      update.resumeOriginalName = req.file.originalname;
    }

    const cleanedUpdate = Object.fromEntries(
      Object.entries(update).filter(([_, value]) => value !== undefined)
    );

    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { $set: cleanedUpdate },
      { upsert: true, new: true }
    );

    if (req.body.fullName) {
      await User.findByIdAndUpdate(userId, { $set: { fullName: req.body.fullName } });
    }

    return res.json({ msg: "Profile updated successfully", profile });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.addTestResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, score, total } = req.body;

    if (!category || score === undefined || total === undefined) {
      return res.status(400).json({ msg: "category, score and total are required" });
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      {
        $push: {
          testHistory: {
            category,
            score,
            total,
            date: new Date(),
          },
        },
      },
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
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    const profile = await StudentProfile.findOne({ userId });

    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ user, profile: profile || {} });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.matchCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    const profiles = await StudentProfile.find({
      skills: { $in: job.skills || [] },
    }).populate("userId", "fullName email");

    const normalizedJobSkills = (job.skills || []).map((s) => s.toLowerCase());

    const candidates = profiles
      .map((profile) => {
        const profileSkills = (profile.skills || []).map((s) => s.toLowerCase());
        const common = profileSkills.filter((s) => normalizedJobSkills.includes(s));
        const matchPercent = normalizedJobSkills.length
          ? Math.round((common.length / normalizedJobSkills.length) * 100)
          : 0;

        return {
          user: profile.userId,
          profile,
          matchPercent,
        };
      })
      .sort((a, b) => b.matchPercent - a.matchPercent);

    return res.json(candidates);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
