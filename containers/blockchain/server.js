const http = require('http');
const { exec } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { gameData } = JSON.parse(body);
        
        if (!gameData || !gameData.player1Name || !gameData.player2Name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: "Missing game data",
            required: ["player1Name", "player1Score", "player2Name", "player2Score"]
          }));
          return;
        }
        const blockchainPrivateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        const avalancheRpcUrl = process.env.AVALANCHE_RPC_URL;
        const snowtraceApiKey = process.env.SNOWTRACE_API_KEY || '';
        
        const command = `GAME_DATA='${JSON.stringify(gameData)}' npx hardhat run scripts/deploy.js --network fuji`;
        
        console.log("Executing:", command);
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error("Deployment error:", error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: "Deployment failed",
              details: stderr.toString() || error.message
            }));
            return;
          }
          
          console.log("Raw output:", stdout);
          
          try {
            const addressMatch = stdout.match(/GameContract deployed to: (0x[a-fA-F0-9]{40})/);
            if (!addressMatch || !addressMatch[1]) {
              throw new Error("Could not find contract address in output");
            }
            
            const contractAddress = addressMatch[1];
            
            const isVerified = stdout.includes("Verification successful") || 
                             stdout.includes("Contract already verified");
            
            let verificationStatus = isVerified ? "success" : "failed";
            let verificationMessage = null;
            
            if (!isVerified) {
              if (stdout.includes("but no API token was found")) {
                verificationStatus = "skipped";
                verificationMessage = "API key not configured";
              } else if (stdout.includes("Contract verification failed")) {
                const verificationErrorMatch = stdout.match(/Contract verification failed: (.*?)(?=\n|$)/);
                verificationMessage = verificationErrorMatch ? verificationErrorMatch[1] : "Unknown verification error";
              }
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              address: contractAddress,
              gameData: gameData,
              verified: isVerified,
              verification: {
                status: verificationStatus,
                message: verificationMessage
              },
              explorerLink: `https://testnet.snowtrace.io/address/${contractAddress}`
            }));
            
          } catch (e) {
            console.error("Output processing error:", e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: "Failed to process deployment output",
              details: e.message,
              rawOutput: stdout
            }));
          }
        });
      } catch (err) {
        console.error("Endpoint error:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(3002, () => {
  console.log('Blockchain service running on port 3002');
});