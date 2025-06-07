export function showFriends(container: HTMLElement): void {
    // Clear the container first
    container.innerHTML = '';
    
    const friendsDiv = document.createElement('div');
    friendsDiv.innerHTML = `
        <h1>My Friends</h1>
        <div id="friendsList">Loading friends...</div>
        <button onclick="navigate('/home')">Back to Home</button>
    `;

    container.appendChild(friendsDiv);

    const friendsList = friendsDiv.querySelector('#friendsList') as HTMLDivElement;

    // Fetch friends list
    fetch('/api/friends', {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.friends.length === 0) {
                    friendsList.innerHTML = `
                        <p>You don't have any friends yet.</p>
                        <p>Visit other users' profiles to add them as friends!</p>
                    `;
                } else {
                    friendsList.innerHTML = `
                        <p>You have ${data.friends.length} friend${data.friends.length > 1 ? 's' : ''}:</p>
                        <ul style="list-style-type: none; padding: 0;">
                            ${data.friends.map(friend => `
                                <li style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; gap: 10px;">
                                    <img src="/api/profile/avatar/${friend.id_user}" 
                                         alt="${friend.username}'s avatar" 
                                         style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                    <div style="flex-grow: 1;">
                                        <strong>${friend.username}</strong>
                                        <br>
                                        <small>Friends since: ${new Date(friend.created_at).toLocaleDateString()}</small>
                                    </div>
                                    <button onclick="navigate('/profile/${friend.username}')" 
                                            style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                                        View Profile
                                    </button>
                                    <button onclick="removeFriendFromList('${friend.username}')" 
                                            style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                                        Remove
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }
            } else {
                friendsList.innerHTML = '<p>Error loading friends list.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
            friendsList.innerHTML = '<p>Error loading friends list.</p>';
        });
}

// Global function to remove friend from the list
(window as any).removeFriendFromList = async function(username: string) {
    if (!confirm(`Are you sure you want to remove ${username} from your friends?`)) {
        return;
    }

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
            // Refresh the friends list
            showFriends(document.getElementById('app') as HTMLElement);
        } else {
            alert('Failed to remove friend: ' + result.message);
        }
    } catch (error) {
        console.error('Error removing friend:', error);
        alert('Failed to remove friend');
    }
};