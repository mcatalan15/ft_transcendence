export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>Home</h1>
		<div><button onclick="navigate('/pong')">Play</button></div>
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

	const socket = new WebSocket('ws://172.19.0.2:3100'); //! or 'wss://' in production

	socket.addEventListener('open', () => {
	console.log('Connected to server');
	socket.send(JSON.stringify({ type: 'join', user: 'Player1' }));
	});

	socket.addEventListener('message', (event) => {
	const data = JSON.parse(event.data);
	console.log('Message from server:', data);
	});

	function sendChatMessage(msg: string) {
	socket.send(JSON.stringify({ type: 'chat', message: msg }));
	}

	// Example usage of sendChatMessage
	sendChatMessage('Hello, this is a test message!');

  }
  