const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting deployment to Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy CharacterManager
  console.log("\n1. Deploying CharacterManager...");
  const CharacterManager = await hre.ethers.getContractFactory("CharacterManager");
  const characterManager = await CharacterManager.deploy();
  await characterManager.waitForDeployment();
  const characterManagerAddress = await characterManager.getAddress();
  console.log("CharacterManager deployed to:", characterManagerAddress);

  // Deploy GalleryManager
  console.log("\n2. Deploying GalleryManager...");
  const GalleryManager = await hre.ethers.getContractFactory("GalleryManager");
  const galleryManager = await GalleryManager.deploy(characterManagerAddress);
  await galleryManager.waitForDeployment();
  const galleryManagerAddress = await galleryManager.getAddress();
  console.log("GalleryManager deployed to:", galleryManagerAddress);

  // Link GalleryManager to CharacterManager
  console.log("\n3. Linking contracts...");
  const setGalleryTx = await characterManager.setGalleryManager(galleryManagerAddress);
  await setGalleryTx.wait();
  console.log("Contracts linked successfully!");

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    contracts: {
      CharacterManager: characterManagerAddress,
      GalleryManager: galleryManagerAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ Deployment completed successfully!");

  // Instructions for verification
  console.log("\n=== Verification Commands ===");
  console.log(`npx hardhat verify --network sepolia ${characterManagerAddress}`);
  console.log(`npx hardhat verify --network sepolia ${galleryManagerAddress} "${characterManagerAddress}"`);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });




