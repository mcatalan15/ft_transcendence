import { getApiUrl } from '../../config/api';
import { navigate } from '../router';

export function loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById('google-script') as HTMLScriptElement;
        if (existingScript && window.google?.accounts) {
            resolve();
            return;
        }

        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-script';
        script.async = true;
        script.defer = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google script'));
        
        document.head.appendChild(script);
    });
}

export function setupGoogleSignUp(): void {
    window.handleGoogleSignUp = (response: any) => {
        const credential = response.credential;
        console.log('Google sign-in successful, processing token...');

        fetch(getApiUrl('/auth/google'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ credential: credential }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('FULL response object:', JSON.stringify(data, null, 2));
                console.log('data.twoFAEnabled:', data.twoFAEnabled);
                console.log('typeof data.twoFAEnabled:', typeof data.twoFAEnabled);
                console.log('Raw /api/auth/google response:', data.twoFAEnabled);
                if (data.success) {
                    
                    sessionStorage.setItem('username', data.username);
                    sessionStorage.setItem('userId', data.userId);
                    sessionStorage.setItem('email', data.email);
                    sessionStorage.setItem('token', data.token);

                    let twoFAValue = data.twoFAEnabled;

                    sessionStorage.setItem('twoFAEnabled', twoFAValue);

                    console.log('Setting twoFAEnabled in sessionStorage:', twoFAValue);
                    console.log('Original backend value:', data.twoFAEnabled);
                    console.log('Value after setting:', sessionStorage.getItem('twoFAEnabled'));

                    setTimeout(() => {
                        navigate('/profile');
                    }, 100);
                    return;
                    
                } else {
                    alert('Google authentication failed: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error during Google authentication:', error);
                alert('Error during authentication. Please try again.');
            });
    };
}

export function initializeGoogleButton(containerId: string): void {
    if (!window.google?.accounts) {
        console.error('Google accounts library not loaded');
        return;
    }

    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }

    window.google.accounts.id.initialize({
        client_id: '49814417427-6kej25nd57avgbpp6k7fgphe9pmtshvf.apps.googleusercontent.com',
        callback: window.handleGoogleSignUp,
        auto_select: false,
        cancel_on_tap_outside: false
    });

    window.google.accounts.id.renderButton(
        document.getElementById(containerId),
        {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            logo_alignment: 'left'
        }
    );
}