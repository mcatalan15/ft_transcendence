// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const GameContract = await ethers.getContractFactory("GameContract");
  
  // Correct deployment method for ethers.js v6
  const contract = await GameContract.deploy();
  
  // Wait for deployment transaction to be mined
  await contract.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await contract.getAddress();
  
  console.log("Contract deployed to:", contractAddress);
  console.log("CONTRACT_ADDRESS=" + contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });