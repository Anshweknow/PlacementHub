const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Initialize MongoDB connection without terminating the process on failure.
connectDB();

// Health route
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});

// Avoid noisy favicon requests returning 500 in some serverless deployments.
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Route mounting
app.use("/auth", require("./Routes/authRoutes"));
app.use("/profile", require("./Routes/profileRoutes"));
app.use("/job", require("./Routes/jobRoutes"));
app.use("/application", require("./Routes/applicationRoutes"));
app.use("/hr", require("./Routes/hrRoutes"));

// Static files
app.use("/uploads", express.static("uploads"));

module.exports = app;
