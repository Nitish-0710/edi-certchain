const axios = require("axios");
const FormData = require("form-data");
const { Readable } = require("stream");

/**
 * IPFS Utility — Real Pinata Integration
 * -----------------------------------------
 * Uploads files to IPFS via Pinata's pinning service (free tier).
 * Free tier: 1GB storage, 500 files, 60 req/min.
 *
 * Gateway URL format: https://gateway.pinata.cloud/ipfs/<CID>
 */

const PINATA_JWT = process.env.PINATA_JWT || "";
const PINATA_API_URL = "https://api.pinata.cloud";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

/**
 * Upload a file buffer to Pinata IPFS.
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - Original file name
 * @returns {object} { cid, url }
 */
async function uploadToIPFS(fileBuffer, fileName) {
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT not set in environment variables");
  }

  try {
    // Create form data for Pinata upload
    const formData = new FormData();

    // Convert buffer to readable stream with a filename
    const stream = Readable.from(fileBuffer);
    formData.append("file", stream, {
      filename: fileName,
      contentType: "application/octet-stream",
    });

    // Add pinata metadata
    const pinataMetadata = JSON.stringify({
      name: fileName,
    });
    formData.append("pinataMetadata", pinataMetadata);

    // Pin options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    // Upload to Pinata
    const response = await axios.post(
      `${PINATA_API_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    const cid = response.data.IpfsHash;
    const url = `${PINATA_GATEWAY}/${cid}`;

    console.log(`📦 File uploaded to Pinata IPFS:`);
    console.log(`   CID: ${cid}`);
    console.log(`   URL: ${url}`);

    return { cid, url };
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    console.error("❌ Pinata upload error:", msg);
    throw new Error(`Failed to upload to IPFS: ${msg}`);
  }
}

/**
 * Get the gateway URL for an IPFS CID.
 * @param {string} cid - The IPFS content identifier
 * @returns {string} The gateway URL
 */
function getIPFSUrl(cid) {
  return `${PINATA_GATEWAY}/${cid}`;
}

/**
 * Check if a file exists on Pinata by CID.
 * @param {string} cid - The content identifier
 * @returns {boolean}
 */
async function checkPinStatus(cid) {
  try {
    const response = await axios.get(
      `${PINATA_API_URL}/pinning/pinJobs?ipfs_pin_hash=${cid}`,
      {
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
      }
    );
    return response.data.count > 0;
  } catch {
    return false;
  }
}

module.exports = {
  uploadToIPFS,
  getIPFSUrl,
  checkPinStatus,
};
