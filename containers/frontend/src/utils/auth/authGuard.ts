import { jwtDecode } from 'jwt-decode';
import { getApiUrl } from '../../config/api';

export async function isUserAuthenticated(): Promise<boolean> {
	const token = sessionStorage.getItem('token');

	console.log('[authGuard] Retrieved token from sessionStorage:', token);
	console.log('[authGuard] Token type:', typeof token);
	console.log('[authGuard] Token length:', token?.length);

	if (!token) {
		console.warn('No access token found in sessionStorage');
		return false;
	}

	const tokenParts = token.split('.');
	console.log('[authGuard] Token parts count:', tokenParts.length);
	console.log('[authGuard] Token parts:', tokenParts.map(part => part.substring(0, 20) + '...'));

	// Validate token format
	if (token.split('.').length !== 3) {
		console.error('[authGuard] Invalid token format - expected 3 parts, got:', tokenParts.length);
		console.error('[authGuard] Full token:', token);
		console.error('Invalid token format:', token);
		sessionStorage.removeItem('token');
		return false;
	}

	try {
		// Change this line:
		const decodedToken: any = jwtDecode(token);
		console.log('[authGuard] Decoded token:', decodedToken);
		const currentTime = Date.now() / 1000;
		console.log('[authGuard] Current time:', currentTime);
		console.log('[authGuard] Token exp:', decodedToken.exp);

			if (!decodedToken.exp || decodedToken.exp < currentTime) {
				// Token has no expiration or is expired
				console.warn('Token is expired:', decodedToken.exp, 'Current time:', currentTime);
				sessionStorage.clear();
				return false;
			}

		console.log('[authGuard] Token is valid');
		return true;
	} catch (error) {
		console.error('[authGuard] Error decoding token:', error);
		console.error('[authGuard] Problematic token:', token);
		console.error('Error decoding token:', error);
		sessionStorage.removeItem('token');
		return false;
	}
}

// export async function isUserAuthenticated(): Promise<boolean> {
//   const token = sessionStorage.getItem('token');

//   console.log('[authGuard] Retrieved token from sessionStorage:', token);
//   console.log('[authGuard] Token type:', typeof token);
//   console.log('[authGuard] Token length:', token?.length);

//   if (!token) {
//     console.warn('No access token found in sessionStorage');
//     return false;
//   }

//   const tokenParts = token.split('.');
//   console.log('[authGuard] Token parts count:', tokenParts.length);
//   console.log('[authGuard] Token parts:', tokenParts.map(part => part.substring(0, 20) + '...'));

//   // Validate token format
//   if (token.split('.').length !== 3) {
// 	console.error('[authGuard] Invalid token format - expected 3 parts, got:', tokenParts.length);
//     console.error('[authGuard] Full token:', token);
//     console.error('Invalid token format:', token);
//     sessionStorage.removeItem('token');
//     return false;
//   }

//   try {
//     const decodedToken: any = jwt(token);
// 	console.log('[authGuard] Decoded token:', decodedToken);
//     const currentTime = Date.now() / 1000;
// 	console.log('[authGuard] Current time:', currentTime);
//     console.log('[authGuard] Token exp:', decodedToken.exp);

//     if (!decodedToken.exp || decodedToken.exp < currentTime) {
//       console.warn('Token expired:', decodedToken.exp, 'Current time:', currentTime);
//       return await tryRefreshToken();
//     }

// 	console.log('[authGuard] Token is valid');
//     return true;
//   } catch (error) {
// 	console.error('[authGuard] Error decoding token:', error);
//     console.error('[authGuard] Problematic token:', token);
//     console.error('Error decoding token:', error);
//     sessionStorage.removeItem('token');
//     return false;
//   }
// }

async function tryRefreshToken(): Promise<boolean> {
	try {
		const response = await fetch(getApiUrl('/auth/refresh'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include', // Send refresh token cookie
		});

		if (!response.ok) {
			console.error('Failed to refresh token:', response.status, response.statusText);
			sessionStorage.clear();
			return false;
		}

		const data = await response.json();
		console.log('Token refresh response:', data);

		if (data.accessToken) {
			sessionStorage.setItem('token', data.accessToken);
			console.log('Stored new access token in sessionStorage');
			return true;
		} else {
			console.error('No access token in refresh response');
			sessionStorage.clear();
			return false;
		}
	} catch (error) {
		console.error('Error during token refresh:', error);
		sessionStorage.clear();
		return false;
	}
}

/* 
export function protectRoute(): void {
	if (!isUserAuthenticated()) {
	navigate('/');
	return;
	}
} */
