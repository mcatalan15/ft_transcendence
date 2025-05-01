import './styles/tailwind.css';
import { showHome } from './views/home';
import { showPong } from './views/pong';
//import { showProfile } from './views/profile';
import { showLogin } from './views/login';

const app = document.getElementById('app') as HTMLElement | null;

if (!app)
	throw new Error('App container not found');

function navigate(path: string): void {
  history.pushState({}, '', path);
  router(path);
}

window.navigate = navigate;

let currentGame: PongGame | null = null;

function router(path: string): void {

  if (!app) return;

  //TODO destroy game when leaving /pong
  if (path !== '/pong' && currentGame) {
    currentGame.destroy();
    currentGame = null;
	console.log('Current game destroyed');
  }

  app.innerHTML = '';

  switch (path) {
    case '/':
      showHome(app);
      break;
	case '/login':
		showLogin(app);
		break;
    case '/pong':
      showPong(app);
      break;
    default:
      app.innerHTML = `<h2>Page not found</h2>
	  <button onclick="navigate('/')">Back home</button>
	  `;
  }
}

window.addEventListener('popstate', () => {
  router(window.location.pathname);
});

router(window.location.pathname);