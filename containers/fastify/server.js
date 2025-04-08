// import all the required modules
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const fastifyMultipart = require('fastify-multipart');
const bcrypt = require('bcrypt'); // encryption for passwords
const sqlite3 = require('sqlite3').verbose();
// const path = require('path');
const underPressure = require('@fastify/under-pressure');
const signupRoutes = require('../routes/signup');

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

fastify.register(signupRoutes);
fastify.register(cors, {
    origin: true, // !Allow requests from any origin, NOT SECURE!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
});
fastify.register(fastifyMultipart);

// Open database
const dbPath = '/usr/src/app/db/mydatabase.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});



// Ensure database connection is established before registering underPressure
db.serialize(() => {
  fastify.register(underPressure, {
    exposeStatusRoute: {
      routeOpts: {
        url: '/metrics',
      },
    },
    healthCheck: async () => {
      // Example: Check if the database is connected
      return new Promise((resolve) => {
        db.get('SELECT 1', (err) => {
          resolve(!err);
        });
      });
    },
  });
});



// Helper function to insert a user into the database
async function saveUserToDatabase(username, email, hashedPassword) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, hashedPassword], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}





const { ADDRESS = '0.0.0.0', PORT = '3100' } = process.env;

fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})