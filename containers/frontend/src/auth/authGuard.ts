export function isUserAuthenticated(): boolean {
	return sessionStorage.getItem('username') || false;
}

export function protectRoute(): void {
	if (!isUserAuthenticated()) {
	  navigate('/');
	}
  }