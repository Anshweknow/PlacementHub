const StudentProfile = require("../models/StudentProfile");

exports.findMatchingCandidates = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }

    // Fetch all students from real model
    const students = await StudentProfile.find();

    const candidates = students.map((student) => {
      const studentSkills = student.skills || [];
      const matchSkills = skills.filter((s) =>
        studentSkills.map(x => x.toLowerCase()).includes(s.toLowerCase())
      );

      const matchScore = Math.round(
        (matchSkills.length / skills.length) * 100
      );

      return {
        id: student.userId, // Use userId so HR can click to view the profile
        fullName: student.fullName || "No Name",
        email: student.email || "NA",
        skills: studentSkills,
        matchedSkills: matchSkills,
        matchScore,
        testHistory: student.testHistory || [], // Include test results in candidate data
        resumeUrl: student.resumeUrl || null,
      };
    });

    const filtered = candidates
      .filter((c) => c.matchScore >= 30) // Minimum 30% match
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ candidates: filtered });

  } catch (err) {
    console.error("Match candidates error:", err);
    res.status(500).json({ message: "Server error" });
  }
};