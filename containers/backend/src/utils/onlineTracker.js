class OnlineTracker {
    constructor() {
        this.onlineUsers = new Map();
        this.cleanupInterval = null;
        this.ACTIVITY_TIMEOUT = 5 * 60 * 1000;
        this.CLEANUP_INTERVAL = 60 * 1000;
    }

    start() {
        if (this.cleanupInterval) return;
        
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveUsers();
        }, this.CLEANUP_INTERVAL);
        
        console.log('Online tracker started');
    }

    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    updateUserActivity(userId) {
        if (!userId) return;
        const userIdStr = userId.toString();
        const now = Date.now();
        
        this.onlineUsers.set(userIdStr, now);
        console.log(`User ${userIdStr} activity updated`);
    }

    isUserOnline(userId) {
        if (!userId) return false;
        
        const userIdStr = userId.toString();
        const lastActivity = this.onlineUsers.get(userIdStr);
        
        if (!lastActivity) return false;
        
        const isOnline = (Date.now() - lastActivity) < this.ACTIVITY_TIMEOUT;
        return isOnline;
    }

    getUserLastActivity(userId) {
        if (!userId) return null;
        return this.onlineUsers.get(userId.toString()) || null;
    }

    removeUser(userId) {
        if (!userId) return;
        const userIdStr = userId.toString();
        this.onlineUsers.delete(userIdStr);
        console.log(`User ${userIdStr} removed from online tracker`);
    }

    cleanupInactiveUsers() {
        const now = Date.now();
        const cutoff = now - this.ACTIVITY_TIMEOUT;
        let removedCount = 0;

        for (const [userId, lastActivity] of this.onlineUsers.entries()) {
            if (lastActivity < cutoff) {
                this.onlineUsers.delete(userId);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            console.log(`Cleaned up ${removedCount} inactive users`);
        }
    }

    getStats() {
        return {
            totalOnlineUsers: this.onlineUsers.size,
            users: Array.from(this.onlineUsers.keys())
        };
    }
}

const onlineTracker = new OnlineTracker();
module.exports = onlineTracker;