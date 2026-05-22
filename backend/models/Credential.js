const mongoose = require("mongoose");

/**
 * Credential Schema
 * ------------------
 * Stores metadata about each credential in MongoDB.
 * The actual credential verification happens on-chain,
 * but MongoDB stores supplementary data like file names,
 * IPFS CIDs, and human-readable metadata.
 */
const credentialSchema = new mongoose.Schema(
  {
    // The SHA-256 hash of the credential file (also stored on-chain)
    credentialHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // The student's Ethereum wallet address
    studentAddress: {
      type: String,
      required: true,
      index: true,
    },

    // The issuer's Ethereum wallet address
    issuerAddress: {
      type: String,
      required: true,
    },

    // IPFS Content Identifier for the uploaded credential file
    ipfsCid: {
      type: String,
      default: null,
    },

    // Original file name of the uploaded credential
    fileName: {
      type: String,
      default: null,
    },

    // Human-readable metadata about the credential
    metadata: {
      title: { type: String, default: "" },          // e.g., "Bachelor of Computer Science"
      description: { type: String, default: "" },     // e.g., "Awarded for completing 4-year program"
      credentialType: { type: String, default: "" },   // e.g., "degree", "certificate", "transcript"
      institution: { type: String, default: "" },      // e.g., "MIT"
    },

    // Whether the credential is still valid (mirrors on-chain state)
    isValid: {
      type: Boolean,
      default: true,
    },

    // Blockchain transaction hash from the issuing transaction
    txHash: {
      type: String,
      default: null,
    },

    // When the credential was issued
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model("Credential", credentialSchema);
