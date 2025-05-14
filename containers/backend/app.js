 Fastify = require('fastify');
const fastifyMultipart = require('fastify-multipart');
const loggerConfig = require('./config/logsConfiguration');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');

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

  // Register Swagger for API documentation
  fastify.register(swagger, {
    openapi: {
	  openapi: '3.0.0',
      info: {
        title: 'ft_transcendence API',
        description: 'API documentation for the ft_transcendence project.\n\n \
			PUT to create or replace\n \
			GET to fetch or list\n \
			DELETE to remove\n \
			PATCH for partial update\n \
			POST for actions\n\n \
			The client and API worked (success - 2xx response code)\n \
			The client application behaved erroneously (client error - 4xx response code)\n \
			The API behaved erroneously (server error - 5xx response code)\n \
		',
        version: '1.0.0'
      },
      host: 'localhost:3100',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json']
    }
  });
  fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });  

  // Register core plugins
  fastify.register(fastifyMultipart);
  
  // Register custom plugins
  fastify.register(require('./plugins/setupCors'));
  fastify.register(require('./plugins/healthCheck'));
  fastify.register(require('./plugins/prometheusMetrics'));
  
  // Register routes
  fastify.register(require('./api/routes/routeLoader'));

  return fastify;
}

module.exports = buildApp;