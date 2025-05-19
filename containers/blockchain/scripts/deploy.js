// scripts/deploy.js DEPLOYING BUT NOT VERIFYING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const hre = require("hardhat");
  
  async function deploy() {
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
      // console.log("Run the following to verify your contract:");
      // console.log(`npx hardhat verify --network fuji ${gameContract.address}`);
      
      return gameContract;
    } catch (error) {
      console.error("Detailed deployment error:", error);
      throw error;
    }
  }
  
  async function verify(gameContractAddress) {
    console.log("Verifying contract at address:", gameContractAddress);
    try {
      await hre.run("verify:verify", {
        address: gameContractAddress,
        constructorArguments: [], // Add constructor arguments if your contract has any
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Verification failed:", error.message);
      // Don't throw here unless you want to stop the entire process
    }
  }
  
  async function main() {
    try {
      const deployedContract = await deploy();
      await verify(deployedContract.address); // Pass the address to verify
    } catch (deployErr) {
      console.error("Deployment failed inside main():", deployErr);
      throw deployErr;
    }
  }
  
  // Execute the deployment
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Deployment and verification proccess failed:", error);
      process.exit(1);
    });

// //

