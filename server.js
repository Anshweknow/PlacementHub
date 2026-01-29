const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware (Moved to top, removed duplicates)
app.use(express.json());
app.use(cors());

// Connect MongoDB
connectDB();

// Default route
app.get("/", (req, res) => {
    res.send("Backend server is running...");
});

// Route Mounting
app.use("/auth", require("./Routes/authRoutes"));
app.use("/profile", require("./Routes/profileRoutes")); // Mounted at /profile
app.use("/job", require("./Routes/jobRoutes"));
app.use("/application", require("./Routes/applicationRoutes"));
app.use("/hr", require("./Routes/hrRoutes"));

// Static Files
app.use("/uploads", express.static("uploads"));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});