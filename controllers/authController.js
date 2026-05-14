const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizeRole = (role = "student") => (String(role).toLowerCase() === "hr" ? "hr" : "student");
const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const MIN_PASSWORD_LENGTH = 8;

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return process.env.JWT_SECRET;
};

const buildAuthResponse = (user, statusCode, res, message) => {
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return res.status(statusCode).json({
    msg: message,
    token,
    role: user.role,
    fullName: user.fullName,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const role = normalizeRole(req.body.role);

    if (!fullName || !email || !password) {
      return res.status(400).json({ msg: "Full name, email, and password are required." });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ msg: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, email, password: hashedPassword, role });

    return buildAuthResponse(user, 201, res, "Registration successful");
  } catch (err) {
    if (err.message.includes("JWT_SECRET")) {
      return res.status(500).json({ msg: "Authentication is not configured. Set JWT_SECRET in the environment variables." });
    }
    if (err.code === 11000) {
      return res.status(409).json({ msg: "An account with this email already exists." });
    }
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid email or password." });
    }

    return buildAuthResponse(user, 200, res, "Login successful");
  } catch (err) {
    if (err.message.includes("JWT_SECRET")) {
      return res.status(500).json({ msg: "Authentication is not configured. Set JWT_SECRET in the environment variables." });
    }
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
