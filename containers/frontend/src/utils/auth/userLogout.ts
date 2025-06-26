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
		console.log('LogOut!!');
		console.log(`userId: ${sessionStorage.getItem('userId')}`);
		sessionStorage.removeItem('userId');
		console.log(`username: ${sessionStorage.getItem('username')}`);
		sessionStorage.removeItem('username');
		console.log(`token: ${sessionStorage.getItem('token')}`);
		sessionStorage.removeItem('token');
		console.log(`email: ${sessionStorage.getItem('email')}`);
		sessionStorage.removeItem('email');
		console.log(`twoFAEnabled ${sessionStorage.getItem('twoFAEnabled')}`);
		sessionStorage.removeItem('twoFAEnabled');
		console.log('Running: sessionStorage.clear();');
		sessionStorage.clear(); // Clear all the sessionStorage
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