const cors = require('@fastify/cors');

module.exports = async function (fastify) {
  fastify.register(cors, {
    origin: true,  // Allow all origins for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Origin', 'X-Requested-With', 'Accept']
  });
};