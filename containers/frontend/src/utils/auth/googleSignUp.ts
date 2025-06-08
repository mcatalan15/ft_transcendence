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
		  sessionStorage.setItem('username', data.username);
		  sessionStorage.setItem('userId', data.userId);
		  sessionStorage.setItem('email', data.email);
		  sessionStorage.setItem('token', data.token);
		  
		  //! Change for prod!
		  //window.location.href = '/auth?from=signup';
		  navigate('/home');
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