const { db } = require('./db/database');
const buildApp = require('./app');
const serverConfig = require('./config/serverConfiguration');

const app = buildApp();
let server;

function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully`);

  server.close(() => {
    console.log('Server closed');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        process.exit(1);
      }
      
      console.log('Database connection closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  });
}

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => gracefulShutdown(signal));
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