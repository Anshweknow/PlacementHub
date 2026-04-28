const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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
  res.send("Backend server is running...");
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
app.use("/hr", ensureDatabaseConnection, require("./Routes/hrRoutes"));

// Static files
app.use("/uploads", express.static("uploads"));

module.exports = app;
