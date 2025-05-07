const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x2E312A37c5B8567db388bad69878d2eF709852f9";
  const GameContract = await ethers.getContractFactory("GameContract");
  const contract = await GameContract.attach(contractAddress);

  // Call the message() function directly
  const message = await contract.getMessage();
  console.log("Message stored in the contract: ", message);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });