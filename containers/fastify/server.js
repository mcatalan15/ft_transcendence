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