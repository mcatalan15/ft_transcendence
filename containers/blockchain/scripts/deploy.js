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

const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const GameContract = await hre.ethers.getContractFactory("GameContract");

  // Deploy the contract to Fuji Testnet
  const gameContract = await GameContract.deploy();

  // Wait for the contract to be deployed
  await gameContract.deployed();

  console.log("GameContract deployed to Fuji Testnet at address:", gameContract.address);
  console.log("Transaction Hash:", gameContract.deployTransaction.hash);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });