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
            ` : ''}
        </div>
        <div id="profileInfo">Loading...</div>
        <button onclick="navigate('/home')">Return home</button>
    `;

    // Append the profile div immediately to avoid timing issues
    container.appendChild(profileDiv);

    const profileInfo = profileDiv.querySelector('#profileInfo') as HTMLParagraphElement;
    const userAvatar = profileDiv.querySelector('#userAvatar') as HTMLImageElement;

    // Set a placeholder/loading state for the avatar
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

    // Fetch and display user profile information
    fetch(apiEndpoint, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            // Force refresh the avatar with cache-busting and error handling
            const avatarUrl = `/api/profile/avatar/${data.userId}?t=${Date.now()}`;
            
            userAvatar.onload = () => {
                console.log('Avatar loaded successfully for user:', data.username);
            };
            
            userAvatar.onerror = () => {
                console.log('Avatar failed to load, using fallback');
                userAvatar.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#ccc"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">No Avatar</text></svg>');
            };
            
            userAvatar.src = avatarUrl;
            
            profileInfo.innerHTML = `
                <div>Username: ${data.username}</div>
                <div>${isOwnProfile ? 'Email: ' + data.email : ''}</div>
            `;
        })
        .catch(error => {
            console.error('Error fetching profile:', error);
            profileInfo.innerHTML = '<div>Error loading profile</div>';
        });
}