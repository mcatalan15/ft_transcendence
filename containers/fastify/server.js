// server.js (Fastify backend)
const Fastify = require('fastify');
const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, // Adds colors to the logs
        translateTime: 'SYS:standard', // Formats the timestamp
        ignore: 'pid,hostname' // Removes unnecessary fields
      }
    }
  }
});
// Example of API route
fastify.get('/api/player/:id', (request, reply) => {
  const { id } = request.params;
  reply.send({ playerId: id, name: 'PlayerName' });
});

const { ADDRESS = '0.0.0.0', PORT = '3000' } = process.env;

fastify.get('/', async (request, reply) => {
  return { message: 'Hello world!' }
})

fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

// Fastify try of config for blockchain

// Root endpoint
fastify.get('/', async (request, reply) => {
  return { 
    service: 'Blockchain Score Service',
    version: '1.0',
    endpoints: {
      health: '/health',
      recordScore: {
        method: 'POST',
        path: '/scores',
        body: {
          tournamentId: 'string',
          player: 'string',
          score: 'number'
        }
      },
      getScores: {
        method: 'GET',
        path: '/scores/:tournamentId'
      }
    }
  };
});

// Health check endpoint (keep your existing one)
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

// Add this error handler for better error messages
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});
// End of blockchain config
