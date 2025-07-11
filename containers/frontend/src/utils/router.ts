import views from './viewsRoutesLoader';
import { isUserAuthenticated } from './auth/authGuard';
import { logUserOut } from './auth/userLogout';

let app: HTMLElement | null = null;

export function startRouter(container: HTMLElement) {
	app = container;

	window.addEventListener('popstate', () => {
		renderRoute(location.pathname);
	});

	renderRoute(location.pathname);
}

export function navigate(path: string) {
	history.pushState({}, '', path);
	renderRoute(path);
}

async function renderRoute(path: string) {
	if (!app) return;

	app.innerHTML = '';

	switch (path) {
		case '/':
			views.showLanding(app);
			break;

		case '/signin':
			views.showSignIn(app);
			break;

		case '/signup':
			views.showSignUp(app);
			break;

		case '/pong':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showPong(app);
			break;

		case '/home':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showHome(app);
			break;

		case '/friends':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showFriends(app);
			break;

		case '/chat':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showChat(app);
			break;

		case '/logout':
			if (await isUserAuthenticated()) {
				logUserOut();
			}
			navigate('/');
			return;

		case '/blockchain': //Delete when blockchain working!!
			views.showBlockchain(app);
			break;

		case '/auth':
			views.showAuth(app);
			break;

		case '/settings':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showSettings(app);
			return;
		
		case '/stats':
			if (!(await isUserAuthenticated())) {
				navigate('/');
				return;
			}
			views.showStats(app);
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