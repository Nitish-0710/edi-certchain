const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Auth Middleware
 * ---------------
 * Verifies JWT token from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "certchain-secret-key"
    );

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Not authorized, token invalid" });
  }
};

module.exports = { protect };
