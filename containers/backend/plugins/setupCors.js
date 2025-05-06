const cors = require('@fastify/cors');

module.exports = async function (fastify) {
  fastify.register(cors, {
    origin: ['https://mrlouf.studio'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    preflight: false,
    hook: 'preHandler'
  });
};