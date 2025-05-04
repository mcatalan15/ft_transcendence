const bcrypt = require('bcrypt');
const { saveUserToDatabase, checkUserExists } = require('../../db/database');  // Adjust path as needed

async function signupHandler(request, reply) {
  const { username, email, password } = request.body;

  if (!username || !email || !password) {
    return reply.status(400).send({ success: false, message: 'All fields are required' });
  }

  try {
    const userExists = await checkUserExists(username, email);
    if (userExists?.exists) {
      if (userExists.usernameExists && userExists.emailExists) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Username and email are already taken' 
        });
      } else if (userExists.usernameExists) {
        return reply.status(400).send({ 
          success: false,
          message: 'Username is already taken' 
        });
      } else if (userExists.emailExists) {
        return reply.status(400).send({ 
          success: false, 
          message: 'Email is already taken' 
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await saveUserToDatabase(username, email, hashedPassword, 'local');

    return reply.status(201).send({
      success: true,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  signupHandler
  // Add other auth handlers here (loginHandler, logoutHandler, etc.)
};