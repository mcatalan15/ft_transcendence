const cors = require('@fastify/cors');

module.exports = async function (fastify) {
  fastify.register(cors, {
    origin: ['https://mrlouf.studio', 'http://localhost:5173', 'http://localhost:3100'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflight: false,
    hook: 'preHandler'
  });
};