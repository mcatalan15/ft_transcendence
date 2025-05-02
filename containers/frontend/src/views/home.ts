import { t } from '../lang';

export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>${t('home_title')}</h1>
		<button onclick="navigate('/game')">${t('play_button')}</button>
		<button onclick="navigate('/login')">${t('login_button')}</button>
		<button onclick="navigate('/profile')">${t('profile_button')}</button>
		<select id="lang-switcher">
		<option value="fr">🇫🇷 FR</option>
		<option value="en">🇬🇧 EN</option>
		<option value="es">🇪🇸 ES</option>
		</select>
		`;

	const langSwitcher = homeDiv.querySelector('#lang-switcher') as HTMLSelectElement | null;
	if (langSwitcher) {
		langSwitcher.value = localStorage.getItem('lang') || 'fr';
		langSwitcher.addEventListener('change', async (e) => {
			const target = e.target as HTMLSelectElement | null;
			if (target) {
				await import('../lang.js').then(async ({ loadLanguage }) => {
					await loadLanguage(target.value);
					location.reload();
				});
			}
		});
	}

	container.appendChild(homeDiv);
  }
  