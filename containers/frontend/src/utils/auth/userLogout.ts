import { getApiUrl } from '../../config/api';

export async function logUserOut(): Promise<{success: boolean, message: string}> {
	try {
		const user = sessionStorage.getItem('username');

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

		sessionStorage.removeItem('userId');
		sessionStorage.removeItem('username');
		sessionStorage.removeItem('token');
		sessionStorage.removeItem('email');
		sessionStorage.removeItem('twoFAEnabled');
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