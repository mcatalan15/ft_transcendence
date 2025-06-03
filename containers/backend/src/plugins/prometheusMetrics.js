const client = require('prom-client');

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
    //activeGames,
    //gamesTotal,
    wsConnections,
    authAttempts,
    //redisStatus
  });
};