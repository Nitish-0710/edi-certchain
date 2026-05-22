const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/db");

// Import routes
const credentialRoutes = require("./routes/credentialRoutes");
const authRoutes = require("./routes/authRoutes");

// Import blockchain service
const blockchainService = require("./services/blockchain/blockchainService");

/**
 * Express Server
 * ---------------
 * Main entry point for the backend API server.
 * Connects to MongoDB, initializes the blockchain service,
 * and mounts all API routes.
 */

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// Middleware
// ========================

// Enable CORS for frontend requests
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ========================
// API Routes
// ========================

// Mount auth routes
app.use("/api/auth", authRoutes);

// Mount credential routes
app.use("/api", credentialRoutes);

// ========================
// Health Check Endpoint
// ========================

app.get("/api/health", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    service: "Credential Management Backend",
    blockchain: {
      rpc: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
      contractAddress: process.env.CONTRACT_ADDRESS || "Not configured",
    },
  });
});

// ========================
// Root Endpoint
// ========================

app.get("/", (req, res) => {
  res.json({
    message: "🎓 Blockchain Credential Management System API",
    version: "1.0.0",
    endpoints: {
      healthCheck: "GET /api/health",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      me: "GET /api/auth/me",
      uploadCredential: "POST /api/uploadCredential",
      verifyCredential: "GET /api/verifyCredential/:hash",
      getCredentials: "GET /api/credentials/:studentAddress",
      revokeCredential: "POST /api/revokeCredential",
    },
  });
});

// ========================
// Error Handling Middleware
// ========================

// Handle multer errors (file upload errors)
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size exceeds 10MB limit" });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err.message && err.message.includes("File type")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ========================
// Server Startup
// ========================

async function startServer() {
  console.log("\n🔧 ============================================");
  console.log("   Blockchain Credential Management System");
  console.log("   ============================================\n");

  // Step 1: Connect to MongoDB
  console.log("📦 Connecting to MongoDB...");
  await connectDB();

  // Step 2: Initialize blockchain service (load ABI + contract address)
  console.log("\n🔗 Initializing blockchain service...");
  blockchainService.initialize();

  // Step 3: Start the Express server
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n📝 API Endpoints:`);
    console.log(`   POST  /api/auth/register`);
    console.log(`   POST  /api/auth/login`);
    console.log(`   GET   /api/auth/me`);
    console.log(`   POST  /api/uploadCredential`);
    console.log(`   GET   /api/verifyCredential/:hash`);
    console.log(`   GET   /api/credentials/:studentAddress`);
    console.log(`   POST  /api/revokeCredential`);
    console.log(`\n============================================\n`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

module.exports = app;
