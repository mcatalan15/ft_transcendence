export async function addFriend(username: string, onSuccess?: () => void): Promise<void> {
    try {
        const response = await fetch('/api/friends/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const result = await response.json();
        if (result.success) {
            alert(`${username} added as friend!`);
            if (onSuccess) {
                onSuccess();
            }
        } else {
            alert('Failed to add friend: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding friend:', error);
        alert('Failed to add friend');
    }
}

export async function removeFriend(username: string, onSuccess?: () => void): Promise<void> {
    try {
        const response = await fetch('/api/friends/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const result = await response.json();
        if (result.success) {
            alert(`${username} removed from friends`);
            if (onSuccess) {
                onSuccess();
            }
        } else {
            alert('Failed to remove friend: ' + result.message);
        }
    } catch (error) {
        console.error('Error removing friend:', error);
        alert('Failed to remove friend');
    }
}