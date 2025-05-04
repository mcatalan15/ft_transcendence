export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>Home</h1>
		<button onclick="navigate('/pong')">Play</button>
		<button onclick="navigate('/signin')">Login</button>
		<button onclick="navigate('/profile')">Profile</button>
		<button onclick="navigate('/logout')">Logout</button>
		<select id="lang-switcher">
		<option value="fr">🇫🇷 FR</option>
		<option value="en">🇬🇧 EN</option>
		<option value="es">🇪🇸 ES</option>
		</select>
		`;

	container.appendChild(homeDiv);
  }
  