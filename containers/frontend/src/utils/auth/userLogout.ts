import { getApiUrl } from '../../config/api';

export async function logUserOut(): Promise<{success: boolean, message: string}> {
	try {
		console.log(sessionStorage.getItem('username'));
		console.log(sessionStorage.getItem('userId'));

		const user = sessionStorage.getItem('userId');
		console.log(`user: ${user}`);
		const response = await fetch(getApiUrl('/auth/logout'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ user }),
			credentials: 'include'
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