// POST /signup for user registration
module.exports = async function (fastify, opts) {
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
	})
};