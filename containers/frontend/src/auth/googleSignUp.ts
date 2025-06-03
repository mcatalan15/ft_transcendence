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
	  console.log("Google sign-in successful, processing token...");
	  
	  fetch('/api/auth/google', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ credential: credential }),
	  })
	  .then(response => response.json())
	  .then(data => {
		if (data.success) {
		  sessionStorage.setItem('username', data.user.username);
		  sessionStorage.setItem('userId', data.user.id);
		  sessionStorage.setItem('email', data.user.email);
		  sessionStorage.setItem('token', data.token);
		  
		  window.location.href = '/auth?from=signup';
		} else {
		  alert('Google authentication failed: ' + data.message);
		}
	  })
	  .catch(error => {
		console.error('Error during Google authentication:', error);
		alert('Error during authentication. Please try again.');
	  });
	};
}