const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route Imports
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/questions");
const progressRoutes = require("./routes/progress");
const leetcodeRoutes = require("./routes/leetcode");

const app = express();

// --- 1. Middleware & CORS ---
const allowedOrigins = [
  "http://localhost:3000",
  "https://code-quest-leet-code-tracker-git-main-ishwari-ns-projects.vercel.app",
  "https://code-quest-leet-code-tracker.vercel.app", // Your main frontend domain
  "https://leetcode-backend-two.vercel.app", // Your actual backend URL (ADDED)
  "https://leetcode-backend.onrender.com" // Keep this if you still use it
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Allow all origins in development, restrict in production
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('CORS blocked: Origin not allowed'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// --- 2. Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

// Better connection handling for Serverless Functions
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};

// Initial connection
connectDB();

// --- 3. Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leetcode", leetcodeRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "LeetCode Tracker API is live!",
    status: "Healthy",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    database: isConnected ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// --- 4. Server Execution ---
const PORT = process.env.PORT || 5000;

// For Render deployment
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for potential serverless deployment
module.exports = app;