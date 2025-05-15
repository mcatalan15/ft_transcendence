// const hre = require("hardhat");

// async function main() {
//   // Deploy the contract
//   const GameContract = await hre.ethers.getContractFactory("GameContract");
//   const gameContract = await GameContract.deploy();

//   await gameContract.deployed();

//   console.log("GameContract deployed to:", gameContract.address);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
// deploy.js (Deploying contract to Fuji Testnet)

// const hre = require("hardhat");

// async function main() {
//   // Get the contract factory
//   const GameContract = await hre.ethers.getContractFactory("GameContract");

//   // Deploy the contract to Fuji Testnet
//   const gameContract = await GameContract.deploy();

//   // Wait for the contract to be deployed
//   await gameContract.deployed();

//   console.log("GameContract deployed to Fuji Testnet at address:", gameContract.address);
//   console.log("Transaction Hash:", gameContract.deployTransaction.hash);
// }

// main()
//   .catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
//   });

// scripts/deploy.js DEPLOYING BUT NOT VERIFYING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const hre = require("hardhat");
  
  async function main() {
    console.log("Starting deployment to Fuji Testnet...");
    console.log("Network config:", hre.network.config);
    
    try {
      // Get the network information
      const [deployer] = await hre.ethers.getSigners();
      console.log("Deploying contracts with the account:", deployer.address);
      console.log("Account balance:", (await deployer.getBalance()).toString());
  
      // Get the contract factory
      const GameContract = await hre.ethers.getContractFactory("GameContract");
      
      console.log("Deploying GameContract...");
      // Deploy the contract
      const gameContract = await GameContract.deploy();
      
      // For hardhat ethers v5 compatibility
      console.log("Waiting for deployment transaction to be mined...");
      await gameContract.deployed();
      
      console.log("GameContract deployed to:", gameContract.address);
      console.log("Transaction hash:", gameContract.deployTransaction.hash);
      
      // For verification later (optional)
      console.log("Run the following to verify your contract:");
      console.log(`npx hardhat verify --network fuji ${gameContract.address}`);
      
      return gameContract;
    } catch (error) {
      console.error("Detailed deployment error:", error);
      throw error;
    }
  }
  
  // Execute the deployment
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });

//
