const jwt = require('jsonwebtoken');

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
  const user = request.session.get('user');
  const token = request.session.get('token');

	if (!user || !token) {
    return reply.status(401).send({
      success: false,
      message: 'Authentication required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) {
        return reply.status(401).send({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }
      try {
        const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newToken = jwt.sign(
          { id: refreshDecoded.id, username: refreshDecoded.username },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );
        request.session.set('token', newToken);
        request.user = refreshDecoded;
        reply.header('x-access-token', newToken);
      } catch {
        return reply.status(401).send({
          success: false,
          message: 'Invalid refresh token. Please log in again.',
        });
      }
    } else {
      return reply.status(401).send({
        success: false,
        message: 'Invalid token',
      });
    }
  }
}

module.exports = { 
	requireAuth,
	verifyToken
};