const User = require("../models/User");

const TRIAL_EMAIL = process.env.TRIAL_EMAIL || "trial@placementhub.local";
const TRIAL_NAME = process.env.TRIAL_NAME || "Trial User";

module.exports = async function (req, res, next) {
  try {
    const requestedRole = String(req.headers["x-trial-role"] || "student").toLowerCase();
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

    req.user = {
      userId: user._id,
      role: user.role,
      isTrial: true,
    };

    next();
  } catch (err) {
    return res.status(500).json({ msg: "Failed to initialize trial user", error: err.message });
  }
};
