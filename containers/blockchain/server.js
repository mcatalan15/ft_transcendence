import express from 'express';
import { exec } from './utils'; // Import the custom exec function

const app = express();
const port = 3002;

app.use(express.json());

// POST /deploy endpoint
app.post('/deploy', async (req, res) => {
  console.log('Received deployment request');
  
  try {
    const output = await exec('npx hardhat run scripts/deploy.js --network fuji');
    console.log(`Deployment output:\n${output}`);
    
    // Match the contract address
    const match = output.match(/Contract deployed to: (0x[a-fA-F0-9]{40})/);
    if (match) {
      return res.json({ address: match[1] });
    } else {
      return res.status(500).json({ error: 'Deployment output did not contain contract address' });
    }
  } catch (error) {
    console.error(`Deployment error: ${error.message}`);
    return res.status(500).json({ error: 'Deployment failed' });
  }
});

app.listen(port, () => {
  console.log(`Blockchain service listening on port ${port}`);
});