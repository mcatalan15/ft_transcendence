export async function localSignIn(email: string, password: string):
	Promise<{success: boolean, message: string, token?: string | null, user?: string | null}> {
	try {
		const response = await fetch('/api/auth/signin', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email, password }),
		});

		const data = await response.json();

		console.log('Frontend received:', data);

		if (!response.ok) {
			return { 
				success: false, 
				message: data.message || 'Sign-in failed. Please try again.',
			};
		}

		localStorage.setItem('user', data.user);

		return { 
			success: true,
			message: 'Sign-in successful!',
			token: data.token,
			user: data.user
		};

	} catch (error) {
		console.error('Error during sign-in:', error);
		return { 
		success: false, 
		message: 'Network error. Please check your connection and try again.' 
		};
	}
}