const Fastify = require('fastify');
const fastifyMultipart = require('fastify-multipart');
const loggerConfig = require('./config/logsConfiguration');

function buildApp() {
  const fastify = Fastify({
    logger: loggerConfig
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