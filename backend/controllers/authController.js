const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Auth Controller
 * ----------------
 * Handles user registration, login, profile retrieval,
 * and wallet address linking.
 */

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "certchain-secret-key", {
    expiresIn: "7d",
  });
};

/**
 * POST /api/auth/register
 * Create a new user account
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, institution } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required" });
    }

    // Validate role
    if (!["student", "issuer", "verifier"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Role must be student, issuer, or verifier" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      institution: institution || "",
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        institution: user.institution,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Optionally check role matches
    if (role && user.role !== role) {
      return res.status(401).json({
        error: `This account is registered as '${user.role}', not '${role}'`,
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        institution: user.institution,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile (requires auth)
 */
const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        institution: user.institution,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get profile" });
  }
};

/**
 * PUT /api/auth/wallet
 * Link a wallet address to the user's account (requires auth)
 */
const updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "walletAddress is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress },
      { new: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        institution: user.institution,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update wallet" });
  }
};

module.exports = { register, login, getMe, updateWallet };
