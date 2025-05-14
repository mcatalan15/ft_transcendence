/// LOCAL !!!!!! WORKING

// const express = require('express');
// const { ethers } = require('hardhat');

// const app = express();
// app.use(express.json());

// app.post('/deploy', async (req, res) => {
//   try {
//     console.log('Received deploy request:', req.body);

//     const GameContract = await ethers.getContractFactory("GameContract");
//     const gameContract = await GameContract.deploy();
//     await gameContract.deployed();

//     console.log('Contract deployed at:', gameContract.address);

//     res.json({ 
//       success: true,
//       address: gameContract.address,
//       txHash: gameContract.deployTransaction.hash
//     });
//   } catch (error) {
//     console.error('Deployment failed:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(3002, () => {
//   console.log("Blockchain service running on port 3002");
// });

// dEPLOYING TO FUJI
//


// server.js (Blockchain service to deploy contract on Fuji)

const express = require('express');
const { exec } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(express.json());

// Endpoint to deploy contract
app.post('/deploy', (req, res) => {
  // Call the deploy script using the exec command
  exec('npx hardhat run scripts/deploy.js --network fuji', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to deploy contract' });
    }
    
    // Log and send the output from the deploy process
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    
    res.json({
      success: true,
      message: "Contract deployed successfully on Fuji Testnet.",
      deploymentDetails: stdout
    });
  });
});

// Start the server
app.listen(3002, () => {
  console.log('Blockchain service running on port 3002');
});
