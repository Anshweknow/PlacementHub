const TRIAL_NAME = process.env.TRIAL_NAME || "Trial User";

exports.register = async (req, res) => {
  return res.status(200).json({
    msg: "Authentication is disabled in trial mode. Use /auth/login to continue as a trial user.",
  });
};

exports.login = async (req, res) => {
  const requestedRole = String(req.body?.role || "student").toLowerCase();
  const role = requestedRole === "hr" ? "hr" : "student";

  return res.json({
    msg: "Trial login successful",
    token: "trial-mode-token",
    role,
    fullName: TRIAL_NAME,
    isTrial: true,
    user: {
      id: "trial-user",
      fullName: TRIAL_NAME,
      email: "trial@placementhub.local",
      role,
    },
  });
};
