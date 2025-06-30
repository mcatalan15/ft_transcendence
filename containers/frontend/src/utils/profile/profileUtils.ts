import { navigate } from "../router";

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
}

export async function changeNickname(newNick: string): Promise<void> {
	try {
		const response = await fetch('/api/profile/nickname', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ nickname: newNick })
		});

        const result = await response.json();
        
        if (result.success) {
            sessionStorage.setItem('username', newNick);
            alert('Nickname changed successfully!');
            navigate('/settings');
        } else {
            // Handle different error cases
            if (result.message && result.message.includes('already exists')) {
                alert('Nickname already exists, please choose another one.');
            } else {
                alert('Failed to change nickname: ' + (result.message || 'Unknown error'));
            }
        }

    } catch (error) {
        console.error('Error changing nickname:', error);
        alert('Network error occurred while changing nickname.');
    }
}