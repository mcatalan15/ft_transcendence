const client = require('prom-client');

// import all the required modules
const Fastify = require('fastify');							//	
const cors = require('@fastify/cors');						//	manage API requests
const fastifyMultipart = require('fastify-multipart');		//	parse multipart contents
const underPressure = require('@fastify/under-pressure');	//	status/healthcheck
const { db, isDatabaseHealthy } = require('./db/database')

// Make logs pretty and readable
const fastify = Fastify({
	logger: {
	  transport: {
		target: 'pino-pretty',
		options: {
		  colorize: true,
		  translateTime: 'SYS:standard',
		  ignore: 'pid,hostname'
		}
	  }
	}
});

fastify.register(cors, {
    origin: true, // !Allows requests from any origin, NOT SECURE!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
});
fastify.register(fastifyMultipart);
fastify.register(require('./routes/registration'));	// user registration

// Ensure database connection is established
db.serialize(() => {
	fastify.register(underPressure, {
	  exposeStatusRoute: {
		routeOpts: { url: '/metrics' },
	  },
	  healthCheck: isDatabaseHealthy,
	});
  });

// Write-Ahead Logging to allow simultaneous writing
db.run("PRAGMA journal_mode=WAL;");

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

fastify.get('/metrics', async (_, reply) => {
  reply.type('text/plain');
  return client.register.metrics();
});

const { ADDRESS = '0.0.0.0', PORT = '3100' } = process.env;

fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
