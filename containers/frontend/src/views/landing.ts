export function showLanding(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
	  <div>
	  	<p class="whitespace-pre-wrap text-9xl font-anatol">P	  NG <\p>
	  </div>
	  <button onclick="navigate('/login')">Connexion</button>
	`;
	container.appendChild(homeDiv);
  }