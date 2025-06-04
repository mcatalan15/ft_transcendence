 Fastify = require('fastify');
const fastifyMultipart = require('@fastify/multipart');
const loggerConfig = require('./logsConfiguration');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const path = require('path');
const fs = require('fs');

function buildApp() {
  const fastify = Fastify({
    logger: loggerConfig
  });

  const avatarDirs = [
    path.join(__dirname, '../public/avatars/defaults'),
    path.join(__dirname, '../public/avatars/uploads')
  ];
  
  avatarDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

	fastify.register(require('@fastify/static'), {
		root: path.join(__dirname, '../public'),
		prefix: '/public/'
	});
  
  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    cookieName: 'sessionId',
	//! Update secret for prod
    secret: 'a-secret-key-that-should-be-in-env-file',
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
			2xx response code:\tsuccess, the client and API worked\n \
			4xx response code:\tclient error, the client application behaved erroneously\n \
			5xx response code:\tserver error, the API behaved erroneously\n \
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
	fastify.register(fastifyMultipart, {
		limits: {	// restrict custom avatars
			fieldNameSize: 100,
			fieldSize: 100,
			fields: 10,
			fileSize: 2 * 1024 * 1024, // 2MB limit
			files: 1,
			headerPairs: 2000
		}
	});
  
  // Register custom plugins
  fastify.register(require('../plugins/setupCors'));
  fastify.register(require('../plugins/healthCheck'));
  fastify.register(require('../plugins/prometheusMetrics'));
  
  // Register routes
  fastify.register(require('../api/routes/routeLoader'));

  return fastify;
}

module.exports = { 
	buildApp
 };