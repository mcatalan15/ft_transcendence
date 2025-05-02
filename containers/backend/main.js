const buildApp = require('./app');
const serverConfig = require('./config/serverConfiguration');

const app = buildApp();

console.log('Registered routes:');
console.log(app.printRoutes());

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