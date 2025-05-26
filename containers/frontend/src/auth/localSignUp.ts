// auth/localSignUp.ts
export async function localSignUp(username: string, email: string, password: string): Promise<{success: boolean, message: string, userId?: number, username?: string}> {
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        console.log('[localSignUp] Backend response data:', data); // <--- ADD THIS LOG

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Registration failed. Please try again.'
            };
        }

        return {
            success: true,
            message: 'Registration successful!',
            userId: data.userId,
            username: data.username
        };

    } catch (error) {
        console.error('Error during registration:', error);
        return {
            success: false,
            message: 'Network error. Please check your connection and try again.'
        };
    }
}
