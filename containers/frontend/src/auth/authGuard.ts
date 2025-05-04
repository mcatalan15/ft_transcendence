export function isUserAuthenticated(): boolean {
	  const user = localStorage.getItem('token');
	return user !== null;
}

export function protectRoute(): void {
	if (!isUserAuthenticated()) {
	  navigate('/landing');
	}
  }