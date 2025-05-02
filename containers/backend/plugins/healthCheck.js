const underPressure = require('@fastify/under-pressure');
const { db, isDatabaseHealthy } = require('../db/database');

module.exports = async function (fastify) {
  // Ensure database connection is established
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