const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org";

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY not found in .env");
}

async function deploy() {
  console.log("Deploying contracts to Sepolia...\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deployer address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Read contract sources
  const characterManagerPath = path.join(__dirname, "../contracts/CharacterManager.sol");
  const galleryManagerPath = path.join(__dirname, "../contracts/GalleryManager.sol");
  
  const characterManagerSource = fs.readFileSync(characterManagerPath, "utf8");
  const galleryManagerSource = fs.readFileSync(galleryManagerPath, "utf8");

  // Compile with solc
  const solc = require("solc");
  
  console.log("Compiling CharacterManager...");
  const characterInput = {
    language: "Solidity",
    sources: {
      "CharacterManager.sol": {
        content: characterManagerSource,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const characterOutput = JSON.parse(solc.compile(JSON.stringify(characterInput)));
  
  if (characterOutput.errors) {
    characterOutput.errors.forEach(err => {
      if (err.severity === "error") {
        console.error("Compilation error:", err.message);
      }
    });
    if (characterOutput.errors.some(err => err.severity === "error")) {
      process.exit(1);
    }
  }

  const characterContract = characterOutput.contracts["CharacterManager.sol"]["CharacterManager"];
  const characterAbi = characterContract.abi;
  const characterBytecode = characterContract.evm.bytecode.object;

  console.log("Compiling GalleryManager...");
  const galleryInput = {
    language: "Solidity",
    sources: {
      "CharacterManager.sol": {
        content: characterManagerSource,
      },
      "GalleryManager.sol": {
        content: galleryManagerSource,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const galleryOutput = JSON.parse(solc.compile(JSON.stringify(galleryInput)));
  
  if (galleryOutput.errors) {
    galleryOutput.errors.forEach(err => {
      if (err.severity === "error") {
        console.error("Compilation error:", err.message);
      }
    });
    if (galleryOutput.errors.some(err => err.severity === "error")) {
      process.exit(1);
    }
  }

  const galleryContract = galleryOutput.contracts["GalleryManager.sol"]["GalleryManager"];
  const galleryAbi = galleryContract.abi;
  const galleryBytecode = galleryContract.evm.bytecode.object;

  // Deploy CharacterManager
  console.log("\n1. Deploying CharacterManager...");
  const characterFactory = new ethers.ContractFactory(characterAbi, characterBytecode, wallet);
  const characterManager = await characterFactory.deploy();
  await characterManager.waitForDeployment();
  const characterManagerAddress = await characterManager.getAddress();
  console.log("✅ CharacterManager deployed to:", characterManagerAddress);

  // Deploy GalleryManager
  console.log("\n2. Deploying GalleryManager...");
  const galleryFactory = new ethers.ContractFactory(galleryAbi, galleryBytecode, wallet);
  const galleryManager = await galleryFactory.deploy(characterManagerAddress);
  await galleryManager.waitForDeployment();
  const galleryManagerAddress = await galleryManager.getAddress();
  console.log("✅ GalleryManager deployed to:", galleryManagerAddress);

  // Link contracts
  console.log("\n3. Linking contracts...");
  const setGalleryTx = await characterManager.setGalleryManager(galleryManagerAddress);
  await setGalleryTx.wait();
  console.log("✅ Contracts linked successfully!");

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Sepolia");
  console.log("Deployer:", wallet.address);
  console.log("CharacterManager:", characterManagerAddress);
  console.log("GalleryManager:", galleryManagerAddress);
  console.log("\n✅ Deployment completed successfully!");

  return {
    characterManager: characterManagerAddress,
    galleryManager: galleryManagerAddress,
  };
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

