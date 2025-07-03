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

function renderRoute(path: string) {
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
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showPong(app);
			break;

		case '/home':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showHome(app);
			break;

		case '/history':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showHistory(app);
			break;

		case '/profile':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			const currentUsername = sessionStorage.getItem('username');
			navigate(`/profile/${currentUsername}`);
			break;

		case '/friends':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showFriends(app);
			break;

		case '/chat':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showChat(app);
			break;

		case '/logout':
			if (isUserAuthenticated()) {
				logUserOut();
			}
			navigate('/');
			break;

		case '/lobby':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showLobby(app, sessionStorage.getItem('username') ?? 'undefined');
			break;

		case '/blockchain': //Delete when blockchain working!!
			views.showBlockchain(app);
			break;

		case '/auth':
			views.showAuth(app);
			break;

		case '/settings':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showSettings(app);
			return;
		
		case '/stats':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showStats(app);
			return;
		
		case '/error404':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			views.showError404(app);
			return;

		default:

			if (path === '/profile' || path.startsWith('/profile/')) {
				if (!isUserAuthenticated()) {
					navigate('/');
					return;
				}

				if (path === '/profile') {
					const currentUsername = sessionStorage.getItem('username');
					navigate(`/profile/${currentUsername}`);
				} else {
					const username = path.substring('/profile/'.length);
					views.showProfile(app, username);
				}
				return;
			} 
			else if (path === '/pong' || path.startsWith('/pong?')) {
				if (!isUserAuthenticated()) {
					navigate('/');
					return;
				}
					views.showPong(app);
				return;
			}

			app.innerHTML = `<h2 style='margin-right:16px'>Page not found</h2>
	  <span style="display: block; height: 20px;"></span>
	  <button onclick="navigate('/')">Back home</button>
	  `;
	}
}