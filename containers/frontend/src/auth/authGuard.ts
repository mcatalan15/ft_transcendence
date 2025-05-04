export function isUserAuthenticated(): boolean {
	  const user = localStorage.getItem('user');
	return user !== null;
}

export function protectRoute(): void {
	if (!isUserAuthenticated()) {
	  navigate('/landing');
	}
  }