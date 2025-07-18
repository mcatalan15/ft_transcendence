import { getApiUrl } from '../../config/api';

export function getAvatarUrlWithToken(userId: string | number): string {
	const token = sessionStorage.getItem('token');
	const baseUrl = getApiUrl(`/profile/avatar/${userId}`);
	const timestamp = Date.now();

	if (token) {
		return `${baseUrl}?token=${encodeURIComponent(token)}&t=${timestamp}`;
	}

	// Fallback sin token (no debería pasar en rutas autenticadas)
	return `${baseUrl}?t=${timestamp}`;
}

export function getAvatarBlobUrlWithToken(userId: string | number): Promise<string> {
	return new Promise(async (resolve, reject) => {
		try {
			const token = sessionStorage.getItem('token');
			if (!token) {
				reject(new Error('No token found'));
				return;
			}

			const response = await fetch(getApiUrl(`/profile/avatar/${userId}`), {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				reject(new Error(`Failed to fetch avatar: ${response.status}`));
				return;
			}

			const blob = await response.blob();
			const blobUrl = URL.createObjectURL(blob);
			resolve(blobUrl);
		} catch (error) {
			reject(error);
		}
	});
}

// Para limpiar blob URLs cuando ya no se necesiten
export function revokeBlobUrl(url: string): void {
	if (url.startsWith('blob:')) {
		URL.revokeObjectURL(url);
	}
}