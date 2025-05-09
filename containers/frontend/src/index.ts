import './styles/tailwind.css';
import i18n from './i18n';
// import i18next from 'i18next';

import { isUserAuthenticated } from './auth/authGuard';
import { showLanding } from './views/landing';
import { showHome } from './views/home';
import { showPong } from './views/pong';
import { showSignIn } from './views/signin';
import { showSignUp } from './views/signup';
import { showProfile} from './views/profile';
import { showBlockchain } from './views/blockchain'; // Delete when blockchain working!

import { logUserOut } from './auth/userLogout';

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
  
  app.innerHTML = '';

  //TODO destroy game when leaving /pong
  if (path !== '/pong' && currentGame) {
    currentGame.destroy();
    currentGame = null;
	console.log('Current game destroyed');
  }

/*  i18n
    .loadNamespaces('signup')

  i18n
    .loadNamespaces('signin')
  i18n  
    .loadNamespaces('landing')*/

  switch(path)
  {
    case'/':
      showLanding(app);
      break;
    case '/signin':
	  showSignIn(app);
	  break;
    case '/signup':
      showSignUp(app);
      break;
    case '/pong':
      if (!isUserAuthenticated()) {
        navigate('/');
        return;
      }
      showPong(app);
      break;
    case '/home':
      showHome(app);
      break;
    case '/profile':
	  if (!isUserAuthenticated()) {
		navigate('/');
		return;
		}
      showProfile(app);
      break;
    case '/logout':
	  if (isUserAuthenticated()){
        logUserOut();
	  }
      navigate('/');
      break;
	case '/blockchain': //Delete when blockchain working!!
		showBlockchain(app);
		break;
    default:
      app.innerHTML = `<h2 style='margin-right:16px'>Page not found</h2>
	  <span style="display: block; height: 20px;"></span>
	  <button onclick="navigate('/')">Back home</button>
	  `;
  }
}

window.addEventListener('popstate', () => {
  router(window.location.pathname);
});

router(window.location.pathname);
