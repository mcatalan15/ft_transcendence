import './styles/tailwind.css';
import { showLanding } from './views/landing';
//import { loadLanguage, getCurrentLang } from './lang';
import { showHome } from './views/home';
import { showPong } from './views/pong';
//import { showProfile } from './views/profile';
import { showSignIn } from './views/signin';
import { showSignUp } from './views/signup';


/*i18next.init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: {
        "key": "hello world"
      }
    }
  }
});*/

const app = document.getElementById('app') as HTMLElement | null;

if (!app)
	throw new Error('App container not found');

/*async function initLanguage() {
  try {
    await loadLanguage(getCurrentLang());
    router(window.location.pathname);
  } catch (error) {
    console.error("Failed to load language:", error);
    // Fallback to a default language or show an error message
  }
}*/

function navigate(path: string): void {
  history.pushState({}, '', path);
  router(path);
}
window.navigate = navigate;

localStorage.setItem('user', 'nico');
console.log(isLoggedIn())

function isLoggedIn() : boolean
{
  return !!localStorage.getItem('user');
  //return false;
}

let currentGame: PongGame | null = null;


app.innerHTML=`<h2>Page not found</h2>`;

function router(path: string): void {
  
  if (!app) return;
  
  app.innerHTML = '';
  
  if(!isLoggedIn() && path !== '/landing')
  {
    showLanding(app);
    return ;
  }

  //TODO destroy game when leaving /pong
  if (path !== '/pong' && currentGame) {
    currentGame.destroy();
    currentGame = null;
	console.log('Current game destroyed');
  }


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
      showPong(app);
      break;
    case '/home':
      showHome(app);
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
