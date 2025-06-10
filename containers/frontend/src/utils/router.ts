import { showLanding } from '../views/landing';
import { showHome } from '../views/home';
import { showPong } from '../views/pong';
import { showSignIn } from '../views/signin';
import { showSignUp } from '../views/signup';
import { showProfile } from '../views/profile';
import { showBlockchain } from '../views/blockchain'; // si sigue en uso
import { showFriends } from '../views/friends';
import { showChat } from '../views/chat';
import { showHistory} from '../views/history';
import { showLobby } from '../views/lobby';
import { showAuth } from '../views/auth';
import { showSettings } from '../views/settings';
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
			showLanding(app);
			break;

		case '/signin':
			showSignIn(app);
			break;

		case '/signup':
			showSignUp(app);
			break;

		case '/pong':
			/* if (!isUserAuthenticated()) {
				navigate('/');
				return;
			} */
			showPong(app);
			break;

		case '/home':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			showHome(app);
			break;
		case '/history':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			showHistory(app);
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
			showFriends(app);
			break;

		case '/chat':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			showChat(app);
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
			showLobby(app, sessionStorage.getItem('username') ?? 'undefined');
			break;

		case '/blockchain': //Delete when blockchain working!!
			showBlockchain(app);
			break;

		case '/auth':
			showAuth(app);
			break;

		case '/settings':
			if (!isUserAuthenticated()) {
				navigate('/');
				return;
			}
			showSettings(app);
			return;;

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
					showProfile(app, username);
				}
				return;
			}

			app.innerHTML = `<h2 style='margin-right:16px'>Page not found</h2>
	  <span style="display: block; height: 20px;"></span>
	  <button onclick="navigate('/')">Back home</button>
	  `;
	}
}