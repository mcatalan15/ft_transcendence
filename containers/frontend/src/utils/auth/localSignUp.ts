export async function localSignUp(username: string, email: string, password: string): Promise<{success: boolean, message: string, userId?: number, username?: string}> {
    try {
        console.log('[localSignUp] Making request to /api/auth/signup');
        
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        
        console.log('[localSignUp] Response status:', response.status);
        console.log('[localSignUp] Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('[localSignUp] Backend response data:', data);
        console.log('[localSignUp] data.userId type:', typeof data.userId, 'value:', data.userId);
        console.log('[localSignUp] data.username type:', typeof data.username, 'value:', data.username);
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Registration failed. Please try again.'
            };
        }
        
        const result = {
            success: true,
            message: 'Registration successful!',
            userId: data.userId,
            username: data.username,
            email: data.email
        };
        
        console.log('[localSignUp] Returning result:', result);
        return result;
        
    } catch (error) {
        console.error('Error during registration:', error);
        return {
            success: false,
            message: 'Network error. Please check your connection and try again.'
        };
    }
}