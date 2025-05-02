import { showLogin } from './views/login';

export function showLanding(container: HTMLElement): void {
	const landingDiv = document.createElement('div');

	landingDiv.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-center bg-neutral-900 text-amber-50">
			<div class="text-9xl font-anatol flex items-center space-x-4">
				<span class="">P</span>
				<button onclick="navigate('/login')"
					class="w-16 h-16 bg-amber-400 rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300 cursor-zoom-in"
					title="Enter">
				</button>
				<span>NG</span>
			</div>
		</div>
	`;

	container.appendChild(landingDiv);
}