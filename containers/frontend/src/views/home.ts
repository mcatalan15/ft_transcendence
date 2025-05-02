export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
	  <h1>Bienvenue sur Pong !</h1>
	  <button onclick="navigate('/login')">Connexion</button>
	  <button onclick="navigate('/pong')">Jouer</button>
	  <button onclick="navigate('/profile')">Profils</button>
	`;
	container.appendChild(homeDiv);
  }
  