const User = require("../models/User");

const TRIAL_EMAIL = process.env.TRIAL_EMAIL || "trial@placementhub.local";
const TRIAL_NAME = process.env.TRIAL_NAME || "Trial User";

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res) => {
  return res.status(200).json({
    msg: "Authentication is disabled in trial mode. Use /auth/login to continue as a trial user.",
  });
};

exports.login = async (req, res) => {
  try {
    const requestedRole = String(req.body?.role || "student").toLowerCase();
    const role = requestedRole === "hr" ? "hr" : "student";

    let user = await User.findOne({ email: TRIAL_EMAIL });

    if (!user) {
      user = await User.create({
        fullName: TRIAL_NAME,
        email: TRIAL_EMAIL,
        password: "trial-user-no-auth",
        role,
      });
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    return res.json({
      msg: "Trial login successful",
      token: "trial-mode-token",
      role: user.role,
      fullName: user.fullName,
      isTrial: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Trial login failed", error: error.message });
  }
};
