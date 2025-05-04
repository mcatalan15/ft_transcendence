export async function logUserOut(user: string): Promise<{success: boolean, message: string}> {
	try {
		const response = await fetch('/api/auth/logout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ user }),
		});

		const data = await response.json();
		
		if (!response.ok) {
			return { 
				success: false, 
				message: data.message || 'Logout failed. Please try again.' 
			};
		}

		// Clear the user data from local storage
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		
		return { 
			success: true,
			message: 'Sign-in successful!'
		};

	} catch (error) {
		console.error('Error during logout:', error);
		return { 
		success: false, 
		message: 'Network error. Please check your connection and try again.' 
		};
	}
}