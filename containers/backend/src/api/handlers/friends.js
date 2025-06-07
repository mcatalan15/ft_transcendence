const { addFriend, removeFriend, getFriendsList, checkFriendship, getUserByUsername } = require('../db/database');

async function addFriendHandler(request, reply) {
    try {
        const sessionUser = request.session.get('user');
        const { username } = request.body;

        if (!username) {
            return reply.status(400).send({
                success: false,
                message: 'Username is required'
            });
        }

        // Get friend's user data
        const friendUser = await getUserByUsername(username);
        if (!friendUser) {
            return reply.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        // Add friendship
        await addFriend(sessionUser.userId, friendUser.id_user);

        return reply.status(201).send({
            success: true,
            message: `${username} added as friend`,
            friend: {
                userId: friendUser.id_user,
                username: friendUser.username
            }
        });

    } catch (error) {
        console.error('Error adding friend:', error);
        
        if (error.message === 'Already friends') {
            return reply.status(400).send({
                success: false,
                message: 'Already friends with this user'
            });
        }
        
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function removeFriendHandler(request, reply) {
    try {
        const sessionUser = request.session.get('user');
        const { username } = request.body;

        const friendUser = await getUserByUsername(username);
        if (!friendUser) {
            return reply.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        const removed = await removeFriend(sessionUser.userId, friendUser.id_user);
        
        if (!removed) {
            return reply.status(400).send({
                success: false,
                message: 'Not friends with this user'
            });
        }

        return reply.status(200).send({
            success: true,
            message: `${username} removed from friends`
        });

    } catch (error) {
        console.error('Error removing friend:', error);
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function getFriendsHandler(request, reply) {
    try {
        const sessionUser = request.session.get('user');
        const friends = await getFriendsList(sessionUser.userId);

        return reply.status(200).send({
            success: true,
            friends: friends
        });

    } catch (error) {
        console.error('Error getting friends:', error);
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    addFriendHandler,
    removeFriendHandler,
    getFriendsHandler
};