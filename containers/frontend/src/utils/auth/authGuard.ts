import * as jwt from 'jwt-decode';
import { getApiUrl } from '../../config/api';
import { navigate } from '../router';

export async function isUserAuthenticated(): Promise<boolean> {

	const token = sessionStorage.getItem('token');

	if (!token) {
		navigate('/');
		return false;
	}

	try {
		const decodedToken: any = jwt.jwtDecode(token);
		const currentTime = Date.now() / 1000;

		if (!decodedToken.exp || decodedToken.exp < currentTime) {
			// Token has no expiration or is expired
			console.warn('Token is expired:', decodedToken.exp, 'Current time:', currentTime);
			sessionStorage.clear();
			navigate('/');
			return false;
		}

		const response = await fetch(getApiUrl('/auth/refresh'), {
			method: 'POST',
			credentials: 'include'
		});

		if (!response.ok) {
			console.error('Failed to renew token:', response.status, response.statusText);
			sessionStorage.clear();
			navigate('/');
			return false;
		}
		const data = await response.json();
		sessionStorage.setItem('token', data.newToken);
		return true;

	} catch (error) {
		console.error('Error decoding token:', error);
		navigate('/');
		return false;
	}
}