const underPressure = require('@fastify/under-pressure');
const { db, isDatabaseHealthy } = require('../api/db/database');

module.exports = async function (fastify) {
  await new Promise((resolve) => {
    db.serialize(() => {
      fastify.register(underPressure, {
        exposeStatusRoute: {
          routeOpts: { url: '/metrics' },
        },
        healthCheck: isDatabaseHealthy,
      });
      resolve();
    });
  });
  
  // Write-Ahead Logging to allow simultaneous writing
  db.run("PRAGMA journal_mode=WAL;");
};