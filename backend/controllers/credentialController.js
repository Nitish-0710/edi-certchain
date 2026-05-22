const crypto = require("crypto");
const Credential = require("../models/Credential");
const blockchainService = require("../services/blockchain/blockchainService");
const { uploadToIPFS } = require("../utils/ipfs");

/**
 * Credential Controller
 * ----------------------
 * Handles all API logic for credential operations:
 *   - uploadCredential:  Issue a new credential
 *   - verifyCredential:  Verify a credential by hash
 *   - getCredentials:    Get all credentials for a student
 *   - revokeCredential:  Revoke an existing credential
 */

/**
 * POST /api/uploadCredential
 * --------------------------
 * Accepts a file (or raw data), generates its SHA-256 hash,
 * uploads it to IPFS (simulated), stores the hash on-chain,
 * and saves metadata in MongoDB.
 *
 * Body (multipart/form-data):
 *   - file: The credential file (PDF, image, etc.)
 *   - studentAddress: Student's Ethereum wallet address
 *   - issuerAddress: Issuer's Ethereum wallet address
 *   - title: Credential title (e.g., "B.Sc. Computer Science")
 *   - description: Description of the credential
 *   - credentialType: Type (degree, certificate, transcript, etc.)
 *   - institution: Issuing institution name
 *
 * Alternative Body (JSON, no file):
 *   - data: Raw string data to hash
 *   - studentAddress, issuerAddress, title, etc.
 */
const uploadCredential = async (req, res) => {
  try {
    const {
      studentAddress,
      issuerAddress,
      title,
      description,
      credentialType,
      institution,
      data, // Optional: raw data string if no file is uploaded
    } = req.body;

    // Validate required fields
    if (!studentAddress) {
      return res.status(400).json({ error: "studentAddress is required" });
    }
    if (!issuerAddress) {
      return res.status(400).json({ error: "issuerAddress is required" });
    }

    let fileBuffer;
    let fileName = "credential-data.txt";

    // Check if a file was uploaded (via multer)
    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else if (data) {
      // If no file, use the raw data string
      fileBuffer = Buffer.from(data, "utf-8");
    } else {
      return res
        .status(400)
        .json({ error: "Either a file or 'data' field is required" });
    }

    // -------------------------------------------------------
    // Step 1: Generate SHA-256 hash of the credential
    // -------------------------------------------------------
    const credentialHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    console.log(`\n📄 Processing credential upload...`);
    console.log(`   Hash: ${credentialHash}`);

    // -------------------------------------------------------
    // Step 2: Upload file to IPFS (simulated)
    // -------------------------------------------------------
    const ipfsResult = await uploadToIPFS(fileBuffer, fileName);
    console.log(`   IPFS CID: ${ipfsResult.cid}`);

    // -------------------------------------------------------
    // Step 3: Store hash on blockchain via smart contract
    // -------------------------------------------------------
    const blockchainResult = await blockchainService.issueCredentialOnChain(
      studentAddress,
      credentialHash
    );
    console.log(`   Tx Hash: ${blockchainResult.txHash}`);

    // -------------------------------------------------------
    // Step 4: Save metadata in MongoDB
    // -------------------------------------------------------
    const credential = new Credential({
      credentialHash,
      studentAddress,
      issuerAddress,
      ipfsCid: ipfsResult.cid,
      fileName,
      metadata: {
        title: title || "",
        description: description || "",
        credentialType: credentialType || "",
        institution: institution || "",
      },
      isValid: true,
      txHash: blockchainResult.txHash,
    });

    await credential.save();
    console.log(`   ✅ Credential saved to database`);

    // -------------------------------------------------------
    // Return success response
    // -------------------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Credential issued successfully",
      credential: {
        credentialHash,
        studentAddress,
        issuerAddress,
        ipfsCid: ipfsResult.cid,
        ipfsUrl: ipfsResult.url,
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        fileName,
        metadata: credential.metadata,
        issuedAt: credential.issuedAt,
      },
    });
  } catch (error) {
    console.error("❌ Upload credential error:", error.message);

    // Check for duplicate hash error
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        error: "A credential with this hash already exists on the blockchain",
      });
    }

    return res.status(500).json({
      error: "Failed to upload credential",
      details: error.message,
    });
  }
};

/**
 * GET /api/verifyCredential/:hash
 * --------------------------------
 * Checks if a credential hash exists on the blockchain and returns its status.
 *
 * Params:
 *   - hash: The SHA-256 hash of the credential to verify
 *
 * Returns:
 *   - Blockchain verification result
 *   - MongoDB metadata (if available)
 */
const verifyCredential = async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({ error: "Credential hash is required" });
    }

    console.log(`\n🔍 Verifying credential: ${hash}`);

    // -------------------------------------------------------
    // Step 1: Verify on the blockchain
    // -------------------------------------------------------
    const blockchainResult =
      await blockchainService.verifyCredentialOnChain(hash);

    // -------------------------------------------------------
    // Step 2: Fetch metadata from MongoDB (if available)
    // -------------------------------------------------------
    let dbRecord = null;
    try {
      dbRecord = await Credential.findOne({ credentialHash: hash });
    } catch (dbError) {
      console.log("⚠️  Could not fetch from MongoDB:", dbError.message);
    }

    // -------------------------------------------------------
    // Return verification result
    // -------------------------------------------------------
    return res.status(200).json({
      success: true,
      verified: blockchainResult.exists && blockchainResult.isValid,
      blockchain: {
        exists: blockchainResult.exists,
        isValid: blockchainResult.isValid,
        issuer: blockchainResult.issuer,
        student: blockchainResult.student,
        timestamp: blockchainResult.timestamp,
        issuedAt: blockchainResult.issuedAt,
      },
      metadata: dbRecord
        ? {
            title: dbRecord.metadata.title,
            description: dbRecord.metadata.description,
            credentialType: dbRecord.metadata.credentialType,
            institution: dbRecord.metadata.institution,
            fileName: dbRecord.fileName,
            ipfsCid: dbRecord.ipfsCid,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Verify credential error:", error.message);
    return res.status(500).json({
      error: "Failed to verify credential",
      details: error.message,
    });
  }
};

/**
 * GET /api/credentials/:studentAddress
 * --------------------------------------
 * Returns all credentials for a given student address.
 * Combines on-chain data with MongoDB metadata.
 *
 * Params:
 *   - studentAddress: The student's Ethereum wallet address
 */
const getCredentials = async (req, res) => {
  try {
    const { studentAddress } = req.params;

    if (!studentAddress) {
      return res.status(400).json({ error: "Student address is required" });
    }

    console.log(`\n📚 Fetching credentials for: ${studentAddress}`);

    // -------------------------------------------------------
    // Step 1: Get credential hashes from the blockchain
    // -------------------------------------------------------
    const onChainHashes =
      await blockchainService.getStudentCredentialsOnChain(studentAddress);

    // -------------------------------------------------------
    // Step 2: Fetch full details from MongoDB
    // -------------------------------------------------------
    let dbRecords = [];
    try {
      dbRecords = await Credential.find({
        studentAddress: { $regex: new RegExp(`^${studentAddress}$`, "i") },
      }).sort({ issuedAt: -1 });
    } catch (dbError) {
      console.log("⚠️  Could not fetch from MongoDB:", dbError.message);
    }

    // -------------------------------------------------------
    // Step 3: Combine on-chain and off-chain data
    // -------------------------------------------------------
    const credentials = dbRecords.map((record) => ({
      credentialHash: record.credentialHash,
      studentAddress: record.studentAddress,
      issuerAddress: record.issuerAddress,
      ipfsCid: record.ipfsCid,
      fileName: record.fileName,
      metadata: record.metadata,
      isValid: record.isValid,
      txHash: record.txHash,
      issuedAt: record.issuedAt,
    }));

    return res.status(200).json({
      success: true,
      studentAddress,
      totalOnChain: onChainHashes.length,
      totalInDB: dbRecords.length,
      credentials,
      onChainHashes: onChainHashes.map((h) => h.toString()),
    });
  } catch (error) {
    console.error("❌ Get credentials error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch credentials",
      details: error.message,
    });
  }
};

/**
 * POST /api/revokeCredential
 * ---------------------------
 * Revokes a credential on the blockchain and updates MongoDB.
 *
 * Body:
 *   - credentialHash: The hash of the credential to revoke
 */
const revokeCredential = async (req, res) => {
  try {
    const { credentialHash } = req.body;

    if (!credentialHash) {
      return res.status(400).json({ error: "credentialHash is required" });
    }

    console.log(`\n🚫 Revoking credential: ${credentialHash}`);

    // -------------------------------------------------------
    // Step 1: Revoke on the blockchain
    // -------------------------------------------------------
    const blockchainResult =
      await blockchainService.revokeCredentialOnChain(credentialHash);

    // -------------------------------------------------------
    // Step 2: Update MongoDB record
    // -------------------------------------------------------
    try {
      await Credential.findOneAndUpdate(
        { credentialHash },
        { isValid: false }
      );
    } catch (dbError) {
      console.log("⚠️  Could not update MongoDB:", dbError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Credential revoked successfully",
      txHash: blockchainResult.txHash,
      blockNumber: blockchainResult.blockNumber,
    });
  } catch (error) {
    console.error("❌ Revoke credential error:", error.message);
    return res.status(500).json({
      error: "Failed to revoke credential",
      details: error.message,
    });
  }
};

module.exports = {
  uploadCredential,
  verifyCredential,
  getCredentials,
  revokeCredential,
};
