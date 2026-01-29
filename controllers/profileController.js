const User = require("../models/user");
const StudentProfile = require("../models/StudentProfile");
const Job = require("../models/job");

// SAVE TEST RESULT TO DATABASE
exports.addTestResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, score, total, date } = req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          testHistory: { category, score, total, date } 
        } 
      },
      { new: true, upsert: true }
    );

    res.json({ msg: "Test result saved", testHistory: profile.testHistory });
  } catch (err) {
    console.error("ADD TEST RESULT ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const userId = req.params.id;

    // UPDATED DUMMY DATA FOR HR VIEWING
    if (userId === "1" || userId === "2") {
      return res.json({
        user: { 
          name: userId === "1" ? "Ansh Kulshreshtha" : "Rahul Sharma", 
          email: userId === "1" ? "ansh@example.com" : "rahul@example.com" 
        },
        profile: {
          fullName: userId === "1" ? "Ansh Kulshreshtha" : "Rahul Sharma",
          college: userId === "1" ? "XYZ Institute" : "ABC University",
          branch: userId === "1" ? "CSE" : "IT",
          skills: ["React", "Node.js", "MongoDB"],
          phone: "9876543210",
          cgpa: "8.5",
          // TEST HISTORY NOW INCLUDED
          testHistory: userId === "1" ? [
            { category: "Programming", score: 12, total: 15, date: "29/01/2026" },
            { category: "Web Development", score: 14, total: 15, date: "29/01/2026" }
          ] : []
        }
      });
    }

    const user = await User.findById(userId).select("-password");
    const profile = await StudentProfile.findOne({ userId });

    res.json({ user, profile: profile || {} });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};