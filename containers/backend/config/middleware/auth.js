/* Middleware function to check if the current user is authenticated */
async function requireAuth(request, reply) {
  const user = request.session.get('user');
  
  if (!user) {
    return reply.status(401).send({
      success: false,
      message: 'Authentication required'
    });
  }
}

async function verifyToken(request, reply) {

	const token = request.body.token;

	if (token) {

        const secret = process.env.JWT_SECRET;
        const decode = jwt.verify(token, secret);

        return reply.status(200).send({
            success: true,
            message: decode,
        });

    } else {

        return reply.status(400).send({
            success: false,
            message: 'Invalid token',
        });
    }
}

module.exports = { 
	requireAuth,
	verifyToken
};