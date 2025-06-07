export function showProfile(container: HTMLElement, username?: string): void {
    
    // Clear the container first to ensure fresh render
    container.innerHTML = '';
    
    const profileDiv = document.createElement('div');
    const currentUser = sessionStorage.getItem('username');
    const isOwnProfile = !username || username === currentUser;
    
    // Determine API endpoint
    const apiEndpoint = username ? `/api/profile/${username}` : '/api/profile';
    
    profileDiv.innerHTML = `
        <h1>${isOwnProfile ? 'My Profile' : `${username}'s Profile`}</h1>
        <div id="avatarSection">
            <img id="userAvatar" src="" 
                 alt="User Avatar" 
                 style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; background-color: #f0f0f0;">
            <br>
            ${isOwnProfile ? `
                <input type="file" id="avatarInput" accept="image/*" style="display: none;">
                <button id="changeAvatarBtn">Change Avatar</button>
            ` : `
                <div id="friendActions"></div>
            `}
        </div>
        <div id="profileInfo">Loading...</div>
        ${isOwnProfile ? `
            <button onclick="navigate('/friends')">View Friends</button>
        ` : ''}
        <button onclick="navigate('/home')">Return home</button>
    `;

    container.appendChild(profileDiv);

    const profileInfo = profileDiv.querySelector('#profileInfo') as HTMLParagraphElement;
    const userAvatar = profileDiv.querySelector('#userAvatar') as HTMLImageElement;

    userAvatar.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Loading...</text></svg>');

    if (isOwnProfile) {
        const avatarInput = profileDiv.querySelector('#avatarInput') as HTMLInputElement;
        const changeAvatarBtn = profileDiv.querySelector('#changeAvatarBtn') as HTMLButtonElement;

        changeAvatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/profile/avatar', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                const result = await response.json();
                if (result.success) {
                    userAvatar.src = result.avatarUrl + '?t=' + Date.now();
                    alert('Avatar updated successfully!');
                } else {
                    alert('Failed to update avatar: ' + result.message);
                }
            } catch (error) {
                console.error('Avatar upload error:', error);
                alert('Failed to upload avatar');
            }
        });
    }

    fetch(apiEndpoint, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            
			userAvatar.src = `/api/profile/avatar/${data.userId}?t=${Date.now()}`;

            profileInfo.innerHTML = `
                <div>Username: ${data.username}</div>
                <div>${isOwnProfile ? 'Email: ' + data.email : ''}</div>
            `;

            if (!isOwnProfile) {
                const friendActions = profileDiv.querySelector('#friendActions') as HTMLDivElement;
                if (data.isFriend) {
                    friendActions.innerHTML = `
                        <button id="removeFriendBtn" style="background-color: #dc3545; color: white;">Remove Friend</button>
                    `;
                    
                    const removeFriendBtn = friendActions.querySelector('#removeFriendBtn') as HTMLButtonElement;
                    removeFriendBtn.addEventListener('click', () => removeFriend(data.username));
                } else {
                    friendActions.innerHTML = `
                        <button id="addFriendBtn" style="background-color: #28a745; color: white;">Add Friend</button>
                    `;
                    
                    const addFriendBtn = friendActions.querySelector('#addFriendBtn') as HTMLButtonElement;
                    addFriendBtn.addEventListener('click', () => addFriend(data.username));
                }
            }
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            profileInfo.innerHTML = '<div>Error loading profile</div>';
        });
}

async function addFriend(username: string) {
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
            showProfile(document.getElementById('app') as HTMLElement, username);
        } else {
            alert('Failed to add friend: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding friend:', error);
        alert('Failed to add friend');
    }
}

async function removeFriend(username: string) {
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
            // Refresh the profile to update the button
            showProfile(document.getElementById('app') as HTMLElement, username);
        } else {
            alert('Failed to remove friend: ' + result.message);
        }
    } catch (error) {
        console.error('Error removing friend:', error);
        alert('Failed to remove friend');
    }
}