const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ msg: "Authentication token is required." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "Authentication is not configured. Set JWT_SECRET in the environment variables." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("role");

    if (!user) {
      return res.status(401).json({ msg: "User account no longer exists." });
    }

    req.user = {
      userId: user._id,
      role: user.role,
    };

    return next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Invalid or expired authentication token." });
    }

    return res.status(500).json({ msg: "Authentication failed", error: err.message });
  }
};
