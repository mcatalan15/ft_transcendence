const { signupSchema } = require('../../schemas/signupSchema');
const { signupHandler } = require('../../handlers/auth');

module.exports = async function (fastify, options) {
  fastify.post('/api/auth/signup', { schema: signupSchema }, signupHandler);
};