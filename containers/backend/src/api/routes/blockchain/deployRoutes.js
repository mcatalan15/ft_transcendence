// routes/blockchain/deployRoutes.js

//async function deployRoutes(fastify) {
//    fastify.post('/api/blockchain', async (request, reply) => {
//        try {
//            const { gameId, player1, player2, winner } = request.body;
//
//            console.log('Received deployment request for game:', gameId);
//            console.log('Players:', player1, 'vs', player2, '| Winner:', winner);
//
//            // For now, return a mock response
//            reply.send({
//                success: true,
//                message: 'Deployment received (mock)',
//                txHash: '0x' + Math.random().toString(16).substr(2, 64)
//            });
//        } catch (error) {
//            fastify.log.error('Deployment error:', error);
//            reply.status(500).send({
//                success: false,
//                message: 'Deployment failed'
//            });
//        }
//    });
//}

// const { getLatestGame } = require("../../db/database");

// async function deployRoutes(fastify) {
//   fastify.post("/api/deploy", async (request, reply) => {
//     try {
//       // 1. Get latest game data from DB
//       const latestGame = await getLatestGame();

//       // 2. Call blockchain container to deploy contract using native fetch
//       const response = await fetch("http://blockchain:3002/deploy", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ gameData: latestGame }),
//       });

//       const blockchainResponse = await response.json();

//       reply.send({
//         success: true,
//         contractAddress: blockchainResponse.address,
//       });
//     } catch (error) {
//       fastify.log.error("Deployment failed:", error);
//       reply.status(500).send({ success: false, error: "Deployment failed" });
//     }
//   });
// }
const { getLatestGame } = require("../../db/database");

async function deployRoutes(fastify) {
  fastify.post("/api/deploy", async (request, reply) => {
    try {
      // 1. Get latest game data from DB
      const latestGame = await getLatestGame();
      
      if (!latestGame) {
        throw new Error("No game data found in database");
      }

      // 2. Map database fields to contract expected fields
      const gameData = {
        teamA: String(latestGame.player1_name || "Player 1"),
        scoreA: Number(latestGame.player1_score || 0),
        teamB: String(latestGame.player2_name || "Player 2"),
        scoreB: Number(latestGame.player2_score || 0)
      };

      // 3. Validate we have required data
      if (!gameData.teamA || !gameData.teamB) {
        throw new Error("Missing player names in game data");
      }

      // 4. Call blockchain container
      const response = await fetch("http://blockchain:3002/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameData }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Blockchain container error: ${error}`);
      }

      const blockchainResponse = await response.json();

      reply.send({
        success: true,
        contractAddress: blockchainResponse.address,
        gameData: {
          player1_name: gameData.teamA,
          player1_score: gameData.scoreA,
          player2_name: gameData.teamB,
          player2_score: gameData.scoreB
        }
      });
    } catch (error) {
      fastify.log.error("Deployment failed:", error);
      reply.status(500).send({ 
        success: false, 
        error: error.message,
        details: "Check if database contains game data with player1_name, player1_score, player2_name, player2_score"
      });
    }
  });
}

module.exports = deployRoutes;

module.exports = deployRoutes;
