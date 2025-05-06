const client = require('prom-client');

module.exports = async function (fastify) {
  // Initialize metrics collection
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  // Register metrics endpoint
  fastify.get('/metrics', async (_, reply) => {
    reply.type('text/plain');
    return client.register.metrics();
  });
};