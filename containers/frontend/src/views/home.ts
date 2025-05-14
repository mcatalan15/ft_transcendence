export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>Home</h1>
		<div><button onclick="navigate('/pong')">Play</button></div>
		<div><button onclick="navigate('/lobby')">Lobby</button></div>
		<div><button onclick="navigate('/profile')">Profile</button></div>
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

	const socket = new WebSocket('ws://localhost:3100/ws'); //! or 'wss://' in production

    const chat = document.getElementById('chat');
    const sendBtn = document.getElementById('send');
    const msgInput = document.getElementById('message');

    socket.addEventListener('open', () => {
      console.log('WebSocket connected');
    });

    socket.addEventListener('message', (event) => {
      const li = document.createElement('li');
      li.textContent = event.data;
      chat.appendChild(li);
    });

    socket.addEventListener('close', () => {
      console.log('WebSocket closed');
    });

    socket.addEventListener('error', (e) => {
      console.error('WebSocket error', e);
    });

    sendBtn.addEventListener('click', () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(msgInput.value);
        msgInput.value = '';
      } else {
        alert('WebSocket is not connected.');
      }
    });

  }
  