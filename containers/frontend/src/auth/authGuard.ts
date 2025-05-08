export function isUserAuthenticated(): boolean {
	  const user = sessionStorage.getItem('authToken');
	return user !== null;
}

export function protectRoute(): void {
	if (!isUserAuthenticated()) {
	  navigate('/landing');
	}
  }