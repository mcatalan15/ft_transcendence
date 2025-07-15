const Fastify = require('fastify');
const fastifyMultipart = require('@fastify/multipart');
const loggerConfig = require('./logsConfiguration');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const path = require('path');
const fs = require('fs');
const cors = require('@fastify/cors');

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
/*   fastify.register(fastifySession, {
    cookieName: 'sessionId',
    secret: process.env.SESSION_SECRET || 'a-secret-key-that-should-be-in-env-file',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.mrlouf.studio' : undefined
    }
  }); */
  fastify.register(require('@fastify/session'), {
      cookieName: 'sessionId',
      secret: process.env.SESSION_SECRET || 'a-secret-key-that-should-be-in-env-file',
      cookie: {
          secure: false,        // Allow HTTP for tunneling
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          sameSite: 'lax'      // CHANGED: Was probably 'strict'
      },
      saveUninitialized: false,
      resave: false
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
      host: process.env.NODE_ENV === 'production' ? 'mrlouf.studio' : 'localhost:3100',
      schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
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
  fastify.register(cors, {
    origin: true,  // Allow all origins for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Origin', 'X-Requested-With', 'Accept']
  });

  fastify.register(require('../plugins/healthCheck'));
  fastify.register(require('../plugins/prometheusMetrics'));

  fastify.register(require('../api/routes/routeLoader'));

  return fastify;
}

module.exports = {
  buildApp
};