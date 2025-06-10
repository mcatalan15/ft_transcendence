export async function logUserOut(): Promise<{success: boolean, message: string}> {
	try {
		const user = sessionStorage.getItem('user');
		
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
		sessionStorage.removeItem('userId');
		sessionStorage.removeItem('username');
		sessionStorage.removeItem('token');
		sessionStorage.removeItem('email');
		
		return {
			success: true,
			message: 'User logged out'
		};

	} catch (error) {
		console.error('Error during logout:', error);
		return { 
		success: false, 
		message: 'Network error. Please check your connection and try again.' 
		};
	}
}