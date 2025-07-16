import { getApiUrl } from '../../config/api';

export async function localSignUp(username: string, email: string, password: string): Promise<{success: boolean, message: string, userId?: number, username?: string, email?: string, token?: string}> {
	try {

		const response = await fetch(getApiUrl('/auth/signup'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password }),
			credentials: 'include'
		});

		const data = await response.json();

		if (!response.ok || !data.success) {
			return {
				success: false,
				message: data.message || 'Registration failed. Please try again.'
			};
		}

		// Store user data in sessionStorage on successful registration
		sessionStorage.setItem('username', data.username);
		sessionStorage.setItem('userId', data.userId);
		sessionStorage.setItem('email', data.email);
		sessionStorage.setItem('token', data.token);
		sessionStorage.setItem('twoFAEnabled', data.twoFAEnabled);
		sessionStorage.setItem('localAuth', 'true');

		const result = {
			success: true,
			message: 'Registration successful!',
			userId: data.userId,
			username: data.username,
			email: data.email,
			token: data.token
		};

		return result;

	} catch (error) {
		console.error('Error during registration:', error);
		return {
			success: false,
			message: 'Network error. Please check your connection and try again.'
		};
	}
}