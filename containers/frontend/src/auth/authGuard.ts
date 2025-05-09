export function isUserAuthenticated(): boolean {
	return sessionStorage.getItem('username') ? true : false;
}

export function protectRoute(): void {
	if (!isUserAuthenticated()) {
	  navigate('/');
	}
  }