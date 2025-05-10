import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';

export function showHome(container: HTMLElement) {
  i18n
    .loadNamespaces('home') // asegúrate de que exista home.json
    .then(() => {
      return i18n.changeLanguage(i18n.language);
    })
    .then(() => {
      container.innerHTML = '';

      const header = new Header().getElement();
      const langSelector = new LanguageSelector(() => translateDOM()).getElement();
      const menu = new Menu().getElement();

      const main = document.createElement('main');
      main.className = 'pt-20 p-4';
      main.innerHTML = `<h1 data-i18n="home.welcome"></h1>`;

      container.appendChild(header);
      container.appendChild(langSelector);
      //container.appendChild(menu); // <- aquí insertas el menú
      container.appendChild(main);

      translateDOM();
    });
}



/*
export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>Home</h1>
		<div><button onclick="navigate('/pong')">Play</button></div>
		<div><button onclick="navigate('/signin')">Login</button></div>
		<div><button onclick="navigate('/profile')">Profile</button></div>
		<div><button onclick="navigate('/blockchain')">Blockchain</button></div>
		<div><button onclick="navigate('/logout')">Logout</button></div>
		<select id="lang-switcher">
		<option value="fr">🇫🇷 FR</option>
		<option value="en">🇬🇧 EN</option>
		<option value="es">🇪🇸 ES</option>
		</select>
		`;

	container.appendChild(homeDiv);
  }*/
  