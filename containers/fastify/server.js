// server.js (Fastify backend)
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const fastifyMultipart = require('fastify-multipart');
const bcrypt = require('bcrypt');


const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, // Adds colors to the logs
        translateTime: 'SYS:standard', // Formats the timestamp
        ignore: 'pid,hostname' // Removes unnecessary fields
      }
    }
  }
});

fastify.register(cors, {
    origin: true, // !Allow requests from any origin, NOT SECURE!
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers
});

fastify.register(fastifyMultipart);

let users = []; // In-memory user storage for demo purposes

// POST /signup for user registration
fastify.post('/signup', async (request, reply) => {
    const { username, email, password } = request.body;

    // Basic validation (you can expand this as needed)
    if (!username || !email || !password) {
        return reply.status(400).send({ success: false, message: 'All fields are required' });
    }

    // Check if the username or email already exists
    const existingUser = users.find(user => user.username === username || user.email === email);
    if (existingUser) {
        return reply.status(400).send({ success: false, message: 'Username or email already taken' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Store the user in memory (in a real app, store it in a database)
        const newUser = { username, email, password: hashedPassword };
        users.push(newUser);

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