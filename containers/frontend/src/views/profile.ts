export function showProfile(container: HTMLElement): void {
	
    const profileDiv = document.createElement('div');
    profileDiv.innerHTML = `
        <h1>Profile</h1>
        <div id="avatarSection">
            <img id="userAvatar" src="/api/profile/avatar/${sessionStorage.getItem('userId')}" 
                 alt="User Avatar" 
                 style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
            <br>
            <input type="file" id="avatarInput" accept="image/*" style="display: none;">
            <button id="changeAvatarBtn">Change Avatar</button>
        </div>
        <div id="profileInfo">Loading...</div>
        <button onclick="navigate('/home')">Return home</button>
    `;

    const avatarInput = profileDiv.querySelector('#avatarInput') as HTMLInputElement;
    const changeAvatarBtn = profileDiv.querySelector('#changeAvatarBtn') as HTMLButtonElement;
    const userAvatar = profileDiv.querySelector('#userAvatar') as HTMLImageElement;

    changeAvatarBtn.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();
            if (result.success) {
                userAvatar.src = result.avatarUrl + '?t=' + Date.now(); // Cache busting
                alert('Avatar updated successfully!');
            } else {
                alert('Failed to update avatar: ' + result.message);
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            alert('Failed to upload avatar');
        }
    });

	const profileInfo = profileDiv.querySelector('#profileInfo') as HTMLParagraphElement;

	// Fetch and display user profile information
	fetch('/api/profile', {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
	})
		.then(response => response.json())
		.then(data => {
			profileInfo.innerHTML = `
			<div>ID: ${data.id}</div>
			<div>Username: ${data.username}</div>
			<div>Email: ${data.email}</div>
		  `;
		})
		.catch(error => {
			navigate('/home');
 			console.error('Error fetching profile:', error);
		});

	container.innerHTML = '';
	container.appendChild(profileDiv);
}