const express = require("express");
const multer = require("multer");
const {
  uploadCredential,
  verifyCredential,
  getCredentials,
  revokeCredential,
} = require("../controllers/credentialController");

/**
 * Credential Routes
 * ------------------
 * Defines all API endpoints for credential operations.
 *
 * Routes:
 *   POST   /api/uploadCredential          - Issue a new credential
 *   GET    /api/verifyCredential/:hash     - Verify a credential by hash
 *   GET    /api/credentials/:studentAddress - Get all credentials for a student
 *   POST   /api/revokeCredential           - Revoke a credential
 */

const router = express.Router();

// ========================
// Multer Configuration
// ========================
// Multer handles multipart/form-data (file uploads)
// Files are stored in memory as Buffer objects (for hashing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max file size: 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept common document and image formats
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/json",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported`), false);
    }
  },
});

// ========================
// Routes
// ========================

/**
 * POST /api/uploadCredential
 * Upload a credential file, hash it, store on IPFS + blockchain + MongoDB
 * Accepts multipart/form-data with a 'file' field, or JSON with a 'data' field
 */
router.post("/uploadCredential", upload.single("file"), uploadCredential);

/**
 * GET /api/verifyCredential/:hash
 * Verify whether a credential hash exists on the blockchain
 */
router.get("/verifyCredential/:hash", verifyCredential);

/**
 * GET /api/credentials/:studentAddress
 * Get all credentials associated with a student's Ethereum address
 */
router.get("/credentials/:studentAddress", getCredentials);

/**
 * POST /api/revokeCredential
 * Revoke an existing credential (only original issuer can revoke)
 */
router.post("/revokeCredential", revokeCredential);

module.exports = router;
