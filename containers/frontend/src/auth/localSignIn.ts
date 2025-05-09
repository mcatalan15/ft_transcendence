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
		sessionStorage.setItem('username', data.user);
	  }
	  
	  return {
		success: response.ok,
		message: data.message,
		user: data.user
	  };
	} catch (error) {
		console.error('Error during sign-in:', error);
		return { 
		success: false, 
		message: 'Network error. Please check your connection and try again.' 
		};
	}
}