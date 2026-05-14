const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

const ensureDatabaseConnection = async (req, res, next) => {
  const connection = await connectDB();
  if (!connection) {
    return res.status(503).json({
      message:
        "Database is not configured. Set MONGO_URI in the environment variables.",
    });
  }

  return next();
};

// Health route
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "PlacementHub API" });
});

app.get("/health", async (req, res) => {
  const connection = await connectDB();
  res.status(connection ? 200 : 503).json({
    status: connection ? "ok" : "degraded",
    database: connection ? "connected" : "not configured",
  });
});

// Avoid noisy favicon requests returning 500 in some serverless deployments.
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Route mounting
app.use("/auth", ensureDatabaseConnection, require("./Routes/authRoutes"));
app.use("/profile", ensureDatabaseConnection, require("./Routes/profileRoutes"));
app.use("/job", ensureDatabaseConnection, require("./Routes/jobRoutes"));
app.use(
  "/application",
  ensureDatabaseConnection,
  require("./Routes/applicationRoutes")
);

// Production API aliases used by the Career Actions module.
app.use("/api/profile", ensureDatabaseConnection, require("./Routes/profileRoutes"));
app.use("/api/jobs", ensureDatabaseConnection, require("./Routes/jobRoutes"));
app.use("/api/applications", ensureDatabaseConnection, require("./Routes/applicationRoutes"));
app.use("/api/hr", ensureDatabaseConnection, require("./Routes/hrRoutes"));
const createHrResourceRouter = require("./Routes/hrResourceRoutes");
app.use("/api/interviews", ensureDatabaseConnection, createHrResourceRouter("interviews"));
app.use("/api/messages", ensureDatabaseConnection, createHrResourceRouter("messages"));
app.use("/api/offers", ensureDatabaseConnection, createHrResourceRouter("offers"));
app.use("/api/analytics", ensureDatabaseConnection, createHrResourceRouter("analytics"));
app.use("/api/company-profile", ensureDatabaseConnection, createHrResourceRouter("company-profile"));
app.use("/hr", ensureDatabaseConnection, require("./Routes/hrRoutes"));

// Static files
app.use("/uploads", express.static(uploadsDir));

app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    msg: statusCode === 500 ? "Server error" : err.message,
    ...(process.env.NODE_ENV === "production" ? {} : { error: err.message }),
  });
});

module.exports = app;
