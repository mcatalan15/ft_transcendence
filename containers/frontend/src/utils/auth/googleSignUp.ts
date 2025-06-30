export function loadGoogleScript(): void {
	if (document.getElementById('google-script')) return;

	const script = document.createElement('script');
	script.src = 'https://accounts.google.com/gsi/client';
	script.id = 'google-script';
	script.async = true;
	script.defer = true;
	document.head.appendChild(script);
}

export function setupGoogleSignUp(): void {
	window.handleGoogleSignUp = (response: any) => {
		const credential = response.credential;
		console.log('Google sign-in successful, processing token...');

		fetch('/api/auth/google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ credential: credential }),
		})
			.then(response => response.json())
			.then(data => {
				console.log('FULL response object:', JSON.stringify(data, null, 2)); // See everything
				console.log('data.twoFAEnabled:', data.twoFAEnabled);
				console.log('typeof data.twoFAEnabled:', typeof data.twoFAEnabled);
				console.log('Raw /api/auth/google response:', data.twoFAEnabled); // Debug raw response
				if (data.success) {
					sessionStorage.setItem('username', data.username);
					sessionStorage.setItem('userId', data.userId);
					sessionStorage.setItem('email', data.email);
					sessionStorage.setItem('token', data.token);

					let twoFAValue = data.twoFAEnabled;

					sessionStorage.setItem('twoFAEnabled', twoFAValue);

					console.log('Setting twoFAEnabled in sessionStorage:', twoFAValue);
					console.log('Original backend value:', data.twoFAEnabled);
					console.log('Value after setting:', sessionStorage.getItem('twoFAEnabled'));

					setTimeout(() => {
						// !Change for production
						// window.location.href = '/auth';
						window.location.href = '/profile';
					}, 100);
				} else {
					alert('Google authentication failed: ' + (data.message || 'Unknown error'));
				}
			})
			.catch(error => {
				console.error('Error during Google authentication:', error);
				alert('Error during authentication. Please try again.');
			});
	};
}