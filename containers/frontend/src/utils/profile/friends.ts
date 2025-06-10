export async function addFriend(username: string, onSuccess?: () => void): Promise<boolean> {
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
			return true;
        } else {
            alert('Failed to add friend: ' + result.message);
			return false;
		}
    } catch (error) {
        alert('Failed to add friend');
		return false;
    }
}

export async function removeFriend(username: string, onSuccess?: () => void): Promise<boolean> {
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
			return true;
        } else {
            alert('Failed to remove friend: ' + result.message);
			return false;
        }
    } catch (error) {
        alert('Failed to remove friend');
		return false;
    }
}

export async function statusFriend(username: string): Promise<boolean> {
	try {
		const response = await fetch(`/api/friends/status/${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		const result = await response.json();
		if (result.success && result.isFriend) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		console.error('Error checking friendship status:', error);
		return false;
	}
<<<<<<< HEAD
}
=======
}
>>>>>>> eva-develop5
