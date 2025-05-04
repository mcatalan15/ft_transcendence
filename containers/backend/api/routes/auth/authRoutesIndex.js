const { signupSchema } = require('../../schemas/auth');
const { signupHandler } = require('../../handlers/auth');

// More schemas and handlers as you add them
// const { loginSchema } = require('../../schemas/auth');
// const { loginHandler } = require('../../handlers/auth');

module.exports = async function (fastify, options) {
  // Register all auth routes
  fastify.post('/api/auth/signup', { schema: signupSchema }, signupHandler);
  
  // Add more routes as you implement them
  // fastify.post('/api/auth/login', { schema: loginSchema }, loginHandler);
};