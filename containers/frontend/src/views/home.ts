export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>Home</h1>
		<div><button onclick="navigate('/pong')">Play</button></div>
		<div><button onclick="navigate('/lobby')">Lobby</button></div>
		<div><button onclick="navigate('/profile/${sessionStorage.getItem('username')}')">Profile</button></div>
		<div><button onclick="navigate('/blockchain')">Blockchain</button></div>
		<div><button onclick="navigate('/chat')">Chat</button></div>
		<div><button onclick="navigate('/logout')">Logout</button></div>
		<select id="lang-switcher">
		<option value="fr">🇫🇷 FR</option>
		<option value="en">🇬🇧 EN</option>
		<option value="es">🇪🇸 ES</option>
		</select>
		`;

	container.appendChild(homeDiv);

  }
  