/* Middleware function to check if the current user is authenticated */
async function requireAuth(request, reply) {
  const user = request.session.get('username');
  
  if (!user) {
    return reply.status(401).send({
      success: false,
      message: 'Authentication required'
    });
  }
}

async function verifyToken(request, reply) {

  const token = request.session.get('token');

	if (!token) {


    return reply.status(400).send({
      success: false,
      message: 'Authentication required',
    });
  }
  
  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return reply.status(200).send({
        success: true,
        message: decoded,
    });

  } catch {

      return reply.status(401).send({
          success: false,
          message: 'Invalid token',
      });
  }
}

module.exports = { 
	requireAuth,
	verifyToken
};