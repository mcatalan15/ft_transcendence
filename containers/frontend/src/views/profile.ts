export function showProfile(container: HTMLElement): void {
	const profileDiv = document.createElement('div');
	profileDiv.innerHTML = `
		<h1>Profile</h1>
		<p id="profileInfo"></p>
		<button style='margin-right:16px' onclick="navigate('/home')">Return home</button>
	`;

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