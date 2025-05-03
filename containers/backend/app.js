const Fastify = require('fastify');
const fastifyMultipart = require('fastify-multipart');
const loggerConfig = require('./config/logsConfiguration');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');


function buildApp() {
  const fastify = Fastify({
    logger: loggerConfig
  });
  
  // Register cookie plugin first
  fastify.register(fastifyCookie);

  // Then register session
  fastify.register(fastifySession, {
    cookieName: 'sessionId',
    secret: 'a-secret-key-that-should-be-in-env-file', // Use a strong secret
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  });

  // Register core plugins
  fastify.register(fastifyMultipart);
  
  // Register custom plugins
  fastify.register(require('./plugins/setupCors'));
  fastify.register(require('./plugins/healthCheck'));
  fastify.register(require('./plugins/prometheusMetrics'));
  
  // Register routes
  fastify.register(require('./routes/routeLoader'));

  return fastify;
}

module.exports = buildApp;