export async function localSignUp(username: string, email: string, password: string): Promise<void> {
	try {
		const response = await fetch('/api/auth/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, email, password }),
		});

		if (!response.ok) {
			throw new Error(`Sign-in failed: ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Sign-in successful:', data);
	} catch (error) {
		console.error('Error during sign-in:', error);
	}
}