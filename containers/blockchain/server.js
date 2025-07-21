const http = require('http');
const { exec } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const server = http.createServer((req, res) => {
  // Only handle POST requests to /deploy
  if (req.method === 'POST' && req.url === '/deploy') {
    let body = '';
    
    // Collect data chunks
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    // Process the complete request body
    req.on('end', () => {
      try {
        // Parse the JSON body
        const { gameData } = JSON.parse(body);
        
        // Validate input
        if (!gameData || !gameData.player1Name || !gameData.player2Name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: "Missing game data",
            required: ["player1Name", "player1Score", "player2Name", "player2Score"]
          }));
          return;
        }
        // Get the required environment variables from the parent process (server.js's env)
        const blockchainPrivateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
        const avalancheRpcUrl = process.env.AVALANCHE_RPC_URL;
        const snowtraceApiKey = process.env.SNOWTRACE_API_KEY || ''; // Ensure this is also passed if used
        
        // --- MODIFIED DEBUGGING LINES START ---
        console.log("DEBUG: server.js sees BLOCKCHAIN_PRIVATE_KEY (FULL):", blockchainPrivateKey);
        console.log("DEBUG: server.js sees AVALANCHE_RPC_URL:", avalancheRpcUrl);
        console.log("DEBUG: server.js sees SNOWTRACE_API_KEY (exists):", !!snowtraceApiKey); // Still just check existence for API key
        // --- MODIFIED DEBUGGING LINES END ---
        // Execute the deployment using environment variable
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
            // Look for contract address in the output
            const addressMatch = stdout.match(/GameContract deployed to: (0x[a-fA-F0-9]{40})/);
            if (!addressMatch || !addressMatch[1]) {
              throw new Error("Could not find contract address in output");
            }
            
            const contractAddress = addressMatch[1];
            
            // Extract verification status - consider any of these messages as success
            const isVerified = stdout.includes("Verification successful") || 
                             stdout.includes("Contract already verified");
            
            // Enhanced error handling for verification
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
            
            // Return successful response even if verification failed
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
            // If we can't extract meaningful data, return the raw output
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
    // Handle any other routes or methods
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the server
server.listen(3002, () => {
  console.log('Blockchain service running on port 3002');
});