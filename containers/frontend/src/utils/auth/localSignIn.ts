import { getApiUrl } from '../../config/api';
import { showAuth } from '../../views/auth';

export async function localSignIn(
    email: string, 
    password: string, 
    twoFACode?: string
): Promise<{ success: boolean; message: string; token?: string; user?: string }> {
    try {
        const requestBody: any = { email, password };
        if (twoFACode) {
            requestBody.twoFACode = twoFACode;
        }

        const response = await fetch(getApiUrl('/auth/signin'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include',
        });

        const data = await response.json();
        
        if (data.success) {

            sessionStorage.setItem('username', data.username || '');
            sessionStorage.setItem('userId', data.userId || '');
			sessionStorage.setItem('email', data.email || '');
            sessionStorage.setItem('localAuth', 'true');
            sessionStorage.setItem('twoFAEnabled', String(data.twoFAEnabled || false));
/* 			if (!data.twoFAEnabled) {
				const app = document.getElementById("app");
				showAuth(app as HTMLElement);
			} */
			sessionStorage.setItem('token', data.token || '');
			
            return {
                success: true,
                message: data.message,
                token: data.token,
                user: data.username
            };
        } else {
            return {
                success: false,
                message: data.message
            };
        }
    } catch (error) {
        console.error('Sign-in error:', error);
        return {
            success: false,
            message: 'Network error occurred'
        };
    }
}