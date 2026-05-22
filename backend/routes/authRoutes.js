const express = require("express");
const {
  register,
  login,
  getMe,
  updateWallet,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

/**
 * Auth Routes
 * ------------
 * POST   /api/auth/register  - Create new account
 * POST   /api/auth/login     - Login and get JWT
 * GET    /api/auth/me        - Get current user (protected)
 * PUT    /api/auth/wallet    - Link wallet address (protected)
 */

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/wallet", protect, updateWallet);

module.exports = router;
