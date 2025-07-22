import views from './viewsRoutesLoader';
import { isUserAuthenticated } from './auth/authGuard';
import { logUserOut } from './auth/userLogout';
import { gameManager } from './GameManager';

let app: HTMLElement | null = null;

export function startRouter(container: HTMLElement) {
	app = container;

	window.addEventListener('beforeunload', () => {
		gameManager.destroyAllGames();
	});
	
	window.addEventListener('popstate', () => {
		renderRoute(location.pathname);
	});

	renderRoute(location.pathname);
}

let lastNavigation = 0;
const NAVIGATION_COOLDOWN = 5; // ms

export function navigate(path: string) {
    const now = Date.now();

    if (now - lastNavigation < NAVIGATION_COOLDOWN) return;

    lastNavigation = now;

    history.pushState({}, '', path);

    renderRoute(path);
}

async function renderRoute(path: string) {
	if (!app) return;
	
	app.innerHTML = '';

	gameManager.destroyAllGames();

	switch (path) {
		case '/':
			views.showLanding(app);
			return;

		case '/signin':
			views.showSignIn(app);
			return;

		case '/signup':
			views.showSignUp(app);
			return;

		case '/pong':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showPong(app);
			return;

		case '/home':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showHome(app);
			return;

		case '/friends':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showFriends(app);
			return;

		case '/chat':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showChat(app);
			return;

		case '/logout':
			if (await isUserAuthenticated()) {
				logUserOut();
			}
			navigate('/');
			return;

		case '/auth':
			views.showAuth(app);
			return;

		case '/settings':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showSettings(app);
			return;
		
		case '/404':
			views.show404(app);
			return;

		default:

			if (path === '/history' || path.startsWith('/history/')) {
				if (!(await isUserAuthenticated())) {
					navigate('/');
					return;
				}

				if (path === '/history') {
					const currentUsername = sessionStorage.getItem('username');
					navigate(`/history/${currentUsername}`);
					return;
				} else {
					const username = path.substring('/history/'.length);
					views.showHistory(app, username);
				}
				return;
			}
			else if (path === '/profile' || path.startsWith('/profile/')) {
				if (!(await isUserAuthenticated())) {
					navigate('/');
					return;
				}

				if (path === '/profile') {
					const currentUsername = sessionStorage.getItem('username');
					navigate(`/profile/${currentUsername}`);
					return;
				} else {
					const username = path.substring('/profile/'.length);
					views.showProfile(app, username);
				}
				return;
			} 
			else if (path === '/pong' || path.startsWith('/pong?')) {
				if (!(await isUserAuthenticated())) {
					navigate('/');
					return;
				}
					views.showPong(app);
				return;
			}

			navigate('/404');
			return;
	}
}