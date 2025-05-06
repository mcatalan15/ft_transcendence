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

module.exports = { requireAuth };