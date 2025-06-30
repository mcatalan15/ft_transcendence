export function localSignIn(email: string, password: string, twoFACode?: string): void {
	const requestBody: any = { email, password };
	if (twoFACode) {
		requestBody.twoFACode = twoFACode;
	}

	fetch('/api/auth/signin', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(requestBody),
		credentials: 'include',
	})
		.then(res => res.json())
		.then(data => {
			console.log('FULL response object:', JSON.stringify(data, null, 2));
			console.log('data.twoFAEnabled:', data.twoFAEnabled);
			console.log('typeof data.twoFAEnabled:', typeof data.twoFAEnabled);
			console.log('Raw /api/auth/signin response:', data.twoFAEnabled);

			if (data.success) {
				sessionStorage.setItem('username', data.username);
				sessionStorage.setItem('userId', data.userId);
				sessionStorage.setItem('email', data.email);
				sessionStorage.setItem('token', data.token);
				sessionStorage.setItem('localAuth', 'true');

				const twoFAValue = data.twoFAEnabled;
				sessionStorage.setItem('twoFAEnabled', twoFAValue);

				console.log('Setting twoFAEnabled in sessionStorage:', twoFAValue);
				console.log('Original backend value:', data.twoFAEnabled);
				console.log('Value after setting:', sessionStorage.getItem('twoFAEnabled'));

/* 				setTimeout(() => {
					window.location.href = '/auth';
				}, 100); */
				navigate('/profile');
			} else {
				alert('Local sign-in failed: ' + (data.message || 'Unknown error'));
			}
		})
		.catch(error => {
			console.error('Error during local sign-in:', error);
			alert('Error during authentication. Please try again.');
		});
}
