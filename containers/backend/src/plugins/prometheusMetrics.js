const client = require('prom-client');

module.exports = async function (fastify) {
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  fastify.get('/metrics', async (_, reply) => {
    reply.type('text/plain');
    return client.register.metrics();
  });
};