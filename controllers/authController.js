const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    res.json({ msg: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN WITH ROLE VALIDATION
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    if (user.role !== role) {
      return res.status(403).json({ msg: "Role mismatch" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "secretKey",
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
      role: user.role,
      fullName: user.name
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login
};