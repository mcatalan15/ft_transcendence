export async function localSignIn(email: string, password: string) {
	try {
	  const response = await fetch('/api/auth/signin', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({ email, password }),
		credentials: 'include'
	  });
  
	  const data = await response.json();

	  if (response.ok) {
		sessionStorage.setItem('username', data.username);
		sessionStorage.setItem('userId', data.userId);
		sessionStorage.setItem('email', data.email);
		sessionStorage.setItem('token', data.token);
	  }
	  
	  return {
		success: response.ok,
		message: data.message,
		user: data.username,
		userId: data.userId,
		token: data.token,
		email: data.email,
	  };

	} catch (error) {
		console.error('Error during sign-in:', error);
		return { 
			success: false, 
			message: 'Network error. Please check your connection and try again.' 
		};
	}
}