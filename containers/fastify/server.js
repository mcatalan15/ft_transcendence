// server.js (Fastify backend)
// import all the required modules
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const fastifyMultipart = require('fastify-multipart');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

// Helper function to insert a user into the database
async function saveUserToDatabase(username, email, hashedPassword) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, hashedPassword], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // Return the ID of the inserted user
      }
    });
  });
}
// POST /signup for user registration
fastify.post('/api/signup', async (request, reply) => {
    const { username, email, password } = request.body;

    // Basic validation (you can expand this as needed)
    if (!username || !email || !password) {
        return reply.status(400).send({ success: false, message: 'All fields are required' });
    }

    // Check if a user with the same username or email already exists
    const query = `SELECT * FROM users WHERE username = ? OR email = ?`;
    db.get(query, [username, email], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return reply.status(500).send({ success: false, message: 'Internal server error' });
      }
      if (row) {
        return reply.status(400).send({ success: false, message: 'Username or email already exists' });
      }
    });

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Save the user to the database
        await saveUserToDatabase(username, email, hashedPassword);

        return reply.status(201).send({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ success: false, message: 'Internal server error' });
    }
});



const { ADDRESS = '0.0.0.0', PORT = '3100' } = process.env;

fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})