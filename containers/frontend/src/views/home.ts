import { t, changeLanguage } from '../lang';

export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>${t('home_title')}</h1>
		<button onclick="navigate('/pong')">${t('play_button')}</button>
		<button onclick="navigate('/signin')">${t('login_button')}</button>
		<button onclick="navigate('/profile')">${t('profile_button')}</button>
		<select id="lang-switcher">
		<option value="fr">🇫🇷 FR</option>
		<option value="en">🇬🇧 EN</option>
		<option value="es">🇪🇸 ES</option>
		</select>
		`;

	const langSwitcher = homeDiv.querySelector('#lang-switcher') as HTMLSelectElement | null;
	if (langSwitcher) {
		changeLanguage(langSwitcher);
	}

	container.appendChild(homeDiv);
  }
  