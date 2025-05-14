async function main() {
  // Get network details
  const network = await ethers.provider.getNetwork();
  console.log('Connected to network:', network.name);
  
  // Get the current block number on Fuji
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log('Current block number:', blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
