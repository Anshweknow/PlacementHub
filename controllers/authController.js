const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ msg: "fullName, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "student",
    });

    return res.status(201).json({
      msg: "User registered successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email: String(email || "").toLowerCase() });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    if (role && user.role !== role) {
      return res.status(403).json({ msg: "Role mismatch" });
    }

    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({
      msg: "Login successful",
      token,
      role: user.role,
      fullName: user.fullName,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ msg: "Login failed", error: error.message });
  }
};
