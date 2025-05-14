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

const { getLatestGame } = require("../../db/database");

async function deployRoutes(fastify) {
  fastify.post("/api/deploy", async (request, reply) => {
    try {
      // 1. Get latest game data from DB
      const latestGame = await getLatestGame();

      // 2. Call blockchain container to deploy contract using native fetch
      const response = await fetch("http://blockchain:3002/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameData: latestGame }),
      });

      const blockchainResponse = await response.json();

      reply.send({
        success: true,
        contractAddress: blockchainResponse.address,
      });
    } catch (error) {
      fastify.log.error("Deployment failed:", error);
      reply.status(500).send({ success: false, error: "Deployment failed" });
    }
  });
}

module.exports = deployRoutes;
