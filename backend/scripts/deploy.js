/**
 * Deployment Script for CredentialStorage Contract
 * -------------------------------------------------
 * This script compiles and deploys the CredentialStorage smart contract
 * to the configured network (localhost or Sepolia).
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of CredentialStorage contract...\n");

  // Get the deployer's account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);

  // Check deployer's balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Get the contract factory
  const CredentialStorage = await hre.ethers.getContractFactory("CredentialStorage");

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const credentialStorage = await CredentialStorage.deploy();

  // Wait for deployment to be mined
  await credentialStorage.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await credentialStorage.getAddress();
  console.log("✅ CredentialStorage deployed to:", contractAddress);

  // -------------------------------------------------------
  // Save the deployed contract address and ABI for the backend
  // -------------------------------------------------------
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  // Save deployment info to a JSON file
  const deploymentPath = path.join(__dirname, "..", "config", "deployment.json");
  
  // Ensure the config directory exists
  const configDir = path.join(__dirname, "..", "config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📁 Deployment info saved to:", deploymentPath);

  // Copy the ABI to a convenient location
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "CredentialStorage.sol",
    "CredentialStorage.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiPath = path.join(configDir, "CredentialStorageABI.json");
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log("📁 Contract ABI saved to:", abiPath);
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Copy the contract address to your .env file:");
  console.log(`      CONTRACT_ADDRESS=${contractAddress}`);
  console.log("   2. Start the backend server: node server.js");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
