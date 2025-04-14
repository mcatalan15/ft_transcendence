// import all the required modules
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const fastifyMultipart = require('fastify-multipart');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const underPressure = require('@fastify/under-pressure');

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

// Fastify try of config for blockchain

// Root endpoint
fastify.get('/', async (request, reply) => {
  return { 
    service: 'Blockchain Score Service',
    version: '1.0',
    endpoints: {
      health: '/health',
      recordScore: {
        method: 'POST',
        path: '/scores',
        body: {
          tournamentId: 'string',
          player: 'string',
          score: 'number'
        }
      },
      getScores: {
        method: 'GET',
        path: '/scores/:tournamentId'
      }
    }
  };
});

// Health check endpoint (keep your existing one)
fastify.get('/health', async () => {
  try {
    const blockNumber = await provider.getBlockNumber();
    return { 
      status: 'healthy',
      network: 'Avalanche Fuji',
      latestBlock: blockNumber 
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
});

// Add this error handler for better error messages
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Add these near your other route definitions
fastify.get('/blockchain', async (request, reply) => {
  return reply.sendFile('blockchain.html');
});

fastify.get('/blockchain/deploy', async (request, reply) => {
  // Forward to blockchain service
  const response = await fetch('http://blockchain:3002/deploy');
  return reply.send(await response.json());
});

fastify.post('/blockchain/scores', async (request, reply) => {
  // Forward to blockchain service
  const response = await fetch('http://blockchain:3002/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request.body)
  });
  return reply.send(await response.json());
});

fastify.post('/blockchain/deploy-contract', async (request, reply) => {
  const { teamAScore, teamBScore } = request.body;
  
  try {
    // Forward to blockchain service
    const response = await fetch('http://blockchain:3002/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamA: teamAScore, teamB: teamBScore })
    });
    
    return reply.send(await response.json());
  } catch (error) {
    return reply.status(500).send({ 
      success: false, 
      error: error.message 
    });
  }
});
// End of blockchain config
