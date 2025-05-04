const bcrypt = require('bcrypt');
const { saveUserToDatabase, 
  checkUserExists,
  getHashedPassword,
  getUserByEmail
} = require('../../db/database');

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

async function signinHandler(request, reply) {

    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: 'All fields are required' });
    }

    try {

      const hash = await getHashedPassword(email);
      if (!hash) {
        return reply.status(400).send({
          success: false,
          message: 'User not found'
        });
      }

      // Compare the provided password with the stored hash
      const match = await bcrypt.compare(password, hash);

      if (match) {

        const user = await getUserByEmail(email);
      
        request.session.set('user', {
          id: user.id,
          username: user.username,
          email: user.email,
          //! Never store sensitive data like passwords !
        });

        return reply.status(201).send({
          success: true,
          message: 'Authentication successful'
        });
      }
      
      return reply.status(400).send({
        success: false,
        message: 'Invalid email or password'
      });

    } catch (error) {

      console.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });

    }
};


module.exports = {
  signupHandler,
  signinHandler,
  // Add other auth handlers here (loginHandler, logoutHandler, etc.)
};