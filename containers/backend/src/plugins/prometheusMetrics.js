const client = require('prom-client');

const dbErrors = new client.Counter({
  name: 'database_errors_total',
  help: 'Total number of database errors',
  labelNames: ['operation']
});

const httpRequestsTotal = new client.Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'route', 'status_code']
  });
  
  const httpRequestDuration = new client.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route'],
	buckets: [0.1, 0.5, 1, 2, 5]
  });

  const wsConnections = new client.Gauge({
	name: 'websocket_connections_active',
	help: 'Number of active WebSocket connections',
	//registers: [register]
  });
  
  const authAttempts = new client.Counter({
	name: 'auth_attempts_total',
	help: 'Total authentication attempts',
	labelNames: ['type', 'result'], // type: local/google, result: success/failure
	//registers: [register]
  });

  const activeGames = new client.Gauge({
	name: 'pong_games_active',
	help: 'Number of active Pong games'
  });
  
  const gamesTotal = new client.Counter({
	name: 'pong_games_total',
	help: 'Total number of games',
	labelNames: ['status']
  });

module.exports = async function (fastify) {
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = (Date.now() - request.startTime) / 1000;
    const route = request.routerPath || request.url;
    
    httpRequestsTotal.labels(
      request.method,
      route,
      reply.statusCode.toString()
    ).inc();
    
    httpRequestDuration.labels(
      request.method,
      route
    ).observe(duration);
  });

  fastify.get('/metrics', async (_, reply) => {
    reply.type('text/plain');
    return client.register.metrics();
  });

  fastify.decorate('metrics', {
    httpRequestsTotal,
    httpRequestDuration,
    activeGames,
    gamesTotal,
    wsConnections,
    authAttempts,
    dbErrors
  });
};