import { showLanding } from '../views/landing';
import { showHome } from '../views/home';
import { showPong } from '../views/pong';
import { showSignIn } from '../views/signin';
import { showSignUp } from '../views/signup';
import { showProfile } from '../views/profile';
import { showFriends } from '../views/friends';
import { showHistory } from '../views/history';
import { showStats } from '../views/stats';
import { showBlockchain } from '../views/blockchain'; // si sigue en uso
import { isUserAuthenticated } from '../auth/authGuard';
import { logUserOut } from '../auth/userLogout';

let appContainer: HTMLElement | null = null;
let currentGame: PongGame | null = null;

export function startRouter(container: HTMLElement) {
  appContainer = container;

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
  if (!appContainer) return;

  appContainer.innerHTML = '';

  if (path !== '/pong' && currentGame) {
    currentGame.destroy();
    currentGame = null;
    console.log('Current game destroyed');
  }

  switch (path) {
    case '/':
      showLanding(appContainer);
      break;
    case '/signin':
      showSignIn(appContainer);
      break;
    case '/signup':
      showSignUp(appContainer);
      break;
    case '/home':
      showHome(appContainer);
      break;
    case '/friends':
      showFriends(appContainer);
      break;
    case '/history':
      showHistory(appContainer);
      break;
    case '/stats':
      showStats(appContainer);
      break;
    case '/pong':
      if (!isUserAuthenticated()) {
        navigate('/');
        return;
      }
      showPong(appContainer);
      break;
    case '/profile':
      /*if (!isUserAuthenticated()) {
        navigate('/');
        return;
      }*/
      showProfile(appContainer);
      break;
    case '/logout':
      if (isUserAuthenticated()) {
        logUserOut();
      }
      navigate('/');
      break;
    case '/blockchain':
      showBlockchain(appContainer);
      break;
    default:
      appContainer.innerHTML = `
        <h2 class="text-xl mb-4">Page not found</h2>
        <button onclick="navigate('/')" class="text-blue-500 underline">Back home</button>
      `;
  }
}
