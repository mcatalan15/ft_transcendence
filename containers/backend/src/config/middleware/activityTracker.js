const onlineTracker = require('../../utils/onlineTracker');

// Middleware to track user activity on each request
async function trackUserActivity(request, reply) {
    // Only track authenticated users
    const user = request.session.get('user');
    if (user && user.userId) {
        onlineTracker.updateUserActivity(user.userId);
    }
}

module.exports = {
    trackUserActivity
};