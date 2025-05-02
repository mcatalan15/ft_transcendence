import './styles/tailwind.css';
import { showHome } from './views/home';
import { showPong } from './views/pong';
//import { showProfile } from './views/profile';
import { showLogin } from './views/login';
import { showLanding } from './views/landing';

const app = document.getElementById('app') as HTMLElement | null;

if (!app)
	throw new Error('App container not found');

function navigate(path: string): void {
  history.pushState({}, '', path);
  router(path);
}
window.navigate = navigate;

//localStorage.setItem('user', 'nico');
//console.log(isLoggedIn())

function isLoggedIn() : boolean
{
  return !!localStorage.getItem('user');
}

let currentGame: PongGame | null = null;


app.innerHTML=`<h2>Page not found</h2>`;

function router(path: string): void {
  
  if (!app) return;
  
  app.innerHTML = '';
  
  if(!isLoggedIn())
  {
    showLogin(app);
    return ;
  }

  if (path !== '/pong' && currentGame) {
    currentGame.destroy();
    currentGame = null;
	console.log('Current game destroyed');
  }


  switch (path) {
    case '/':
      showLanding(app);
      break;
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
