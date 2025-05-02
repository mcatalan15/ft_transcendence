export function showLanding(container: HTMLElement): void {
	const landingDiv = document.createElement('div');

	landingDiv.innerHTML = `
		<div class="h-screen relative bg-neutral-900 text-amber-50 flex flex-col items-center justify-center">

			<div class="absolute top-6 w-full flex justify-center gap-x-4">
				<button onclick="navigate('/login')"
					class="bg-amber-50 text-neutral-900 px-4 py-2 rounded">
					Sign in
				</button>
				<button onclick="navigate('/register')"
					class="border border-amber-50 text-amber-50 px-4 py-2 rounded">
					Sign up
				</button>
			</div>

			<div class="text-9xl font-anatol flex items-center space-x-4">
				<span>P</span>
				<button onclick="navigate('/login')"
					class="w-16 h-16 bg-amber-400 rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300 cursor-zoom-in"
					title="Entrar">
				</button>
				<span>NG</span>
			</div>
		</div>
	`;

	container.appendChild(landingDiv);
}
