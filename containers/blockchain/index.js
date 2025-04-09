require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const { ethers } = require('ethers');

// Initialize Avalanche Fuji connection
const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);

fastify.get('/health', async () => {
  try {
    const blockNumber = await provider.getBlockNumber();
    return { 
      status: 'healthy',
      network: 'Avalanche Fuji',
      latestBlock: blockNumber 
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
});

const start = async () => {
  try {
    await fastify.listen({ 
      port: process.env.FASTIFY_PORT || 3002,
      host: process.env.FASTIFY_ADDRESS || '0.0.0.0'
    });
    console.log(`Blockchain service running on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
