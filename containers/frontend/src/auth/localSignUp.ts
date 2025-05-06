export async function localSignUp(username: string, email: string, password: string): Promise<{success: boolean, message: string}> {
	try {
		const response = await fetch('/api/auth/signup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, email, password }),
		});

		const data = await response.json();
		
		if (!response.ok) {
			return { 
				success: false, 
				message: data.message || 'Registration failed. Please try again.' 
			};
		}

		return { 
			success: true,
			message: 'Registration successful!'
		};

	} catch (error) {
		console.error('Error during registration:', error);
		return { 
		success: false, 
		message: 'Network error. Please check your connection and try again.' 
		};
	}
}