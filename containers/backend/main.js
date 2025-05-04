const { gracefulShutdown } = require('./config/serverConfiguration');
const serverConfig = require('./config/serverConfiguration');
const buildApp = require('./app');
const { db } = require('./db/database');

const app = buildApp();

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(app, db, signal));
});

app.listen({ 
  host: serverConfig.ADDRESS, 
  port: serverConfig.PORT 
}, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);

});