export function showLanding(container: HTMLElement): void {
	const landingDiv = document.createElement('div');

	landingDiv.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-center bg-black text-white">
			<!-- Palabra PONG sin la "O", con la pelota en su lugar -->
			<div class="text-9xl font-anatol flex items-center space-x-4">
				<span class="">P</span>
				<!-- Pelota animada como botón -->
				<button onclick="navigate('/login')"
					class="w-16 h-16 bg-white rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300"
					title="Entrar al juego">
				</button>
				<span>NG</span>
			</div>
		</div>
	`;

	container.appendChild(landingDiv);
}