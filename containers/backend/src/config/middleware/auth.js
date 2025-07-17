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

// async function verifyToken(request, reply) {
// 	const user = request.session.get('user');
// 	const token = request.session.get('token');
// 	console.log('[middleware/auth] user', user);
// console.log('[middleware/auth] vToken', token);
// 	if (!user || !token) {
//     return reply.status(401).send({
//       success: false,
//       message: 'Authentication required',
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     request.user = decoded;
//   } catch (err) {
//     if (err.name === 'TokenExpiredError') {
//       const refreshToken = request.cookies.refreshToken;
//       if (!refreshToken) {
//         return reply.status(401).send({
//           success: false,
//           message: 'Session expired. Please log in again.',
//         });
//       }
//       try {
//         const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//         const newToken = jwt.sign(
//           { id: refreshDecoded.id, username: refreshDecoded.username },
//           process.env.JWT_SECRET,
//           { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
//         );
//         request.session.set('token', newToken);
//         request.user = refreshDecoded;
//         reply.header('x-access-token', newToken);
//       } catch {
//         return reply.status(401).send({
//           success: false,
//           message: 'Invalid refresh token. Please log in again.',
//         });
//       }
//     } else {
//       return reply.status(401).send({
//         success: false,
//         message: 'Invalid token',
//       });
//     }
//   }
// }

async function verifyToken(request, reply) {
  let token = null;
  
  // First, try to get token from Authorization header
  const authHeader = request.headers.authorization;
  console.log('[middleware/auth] authHeader:', authHeader);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('[middleware/auth] token from header:', token ? 'PRESENT' : 'MISSING');
  }
  
  // If no token in header, fall back to session
  if (!token) {
    token = request.session.get('token');
    console.log('[middleware/auth] token from session:', token ? 'PRESENT' : 'MISSING');
  }
  
  // If still no token, check if user exists in session (for backward compatibility)
  const user = request.session.get('user');
  console.log('[middleware/auth] user from session:', user ? 'PRESENT' : 'MISSING');
  
  if (!token) {
    return reply.status(401).send({
      success: false,
      message: 'Authentication required - no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[middleware/auth] token verified successfully for user:', decoded.id);
    request.user = decoded;
  } catch (err) {
    console.error('[middleware/auth] token verification failed:', err.message);
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