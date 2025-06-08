import { addFriend, removeFriend } from '../utils/profile/friends';

export function showProfile(container: HTMLElement, username?: string): void {

    // Clear the container first to ensure fresh render
    container.innerHTML = '';

    const profileDiv = document.createElement('div');
    const currentUser = sessionStorage.getItem('username');
    const isOwnProfile = !username || username === currentUser;

    // API endpoint
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
        .then(response => {
            // Check if user exists (404 = user not found)
            if (response.status === 404) {
                container.innerHTML = `
                    <div style="text-align: center; margin-top: 50px;">
                        <h1>User Not Found</h1>
                        <p>The user "${username}" does not exist.</p>
                        <button onclick="navigate('/home')" style="background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                            Back to Home
                        </button>
                    </div>
                `;
                return null; // Don't continue processing
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        })
        .then(data => {

            if (!data) return;

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
                    removeFriendBtn.addEventListener('click', () => {
                        removeFriend(data.username, () => {
                            // Refresh the profile to update the button
                            showProfile(container, username);
                        });
                    });
                } else {
                    friendActions.innerHTML = `
                        <button id="addFriendBtn" style="background-color: #28a745; color: white;">Add Friend</button>
                    `;

                    const addFriendBtn = friendActions.querySelector('#addFriendBtn') as HTMLButtonElement;
                    addFriendBtn.addEventListener('click', () => {
                        addFriend(data.username, () => {
                            // Refresh the profile to update the button
                            showProfile(container, username);
                        });
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            profileInfo.innerHTML = '<div>Error loading profile</div>';
        });
}