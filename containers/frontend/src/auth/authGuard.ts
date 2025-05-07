export function isUserAuthenticated(): boolean {
	  const user = localStorage.getItem('authToken');
	return user !== null;
}

export function protectRoute(): void {
	if (!isUserAuthenticated()) {
	  navigate('/landing');
	}
  }