function gracefulShutdown(app, db, signal) {
  console.log(`Received ${signal}, shutting down gracefully`);

  app.close(() => {
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

module.exports = {
  ADDRESS: process.env.ADDRESS || '0.0.0.0',
  PORT: parseInt(process.env.PORT || '3100', 10),

  gracefulShutdown
};