const mongoose = require("mongoose");

/**
 * MongoDB Connection
 * -------------------
 * Connects to MongoDB using the URI from environment variables.
 * Falls back to a local MongoDB instance if no URI is provided.
 */
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/credential-system";

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit process with failure in production
    // In development, we allow the server to run without MongoDB
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    console.log("⚠️  Server will continue without MongoDB. Some features may not work.");
  }
};

module.exports = connectDB;
