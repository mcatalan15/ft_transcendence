
import { navigate } from '../utils/router';
import { bounceBall } from '../components/generalComponents/ballComponent/bounceBall';

export function showError404(container: HTMLElement): void {
  container.innerHTML = `
    <section class="bg-neutral-900 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div class="mx-auto max-w-screen-sm text-center relative">
          <div id="error-animation-layer" class="fixed inset-0 z-0 pointer-events-none"></div>
          <h1 class="mb-4 text-9xl tracking-tight font-anatol text-amber-50 flex items-center justify-center gap-2 relative z-10">
            4
            <button id="error-bounce-btn" class="inline-block w-16 h-16 bg-amber-400 rounded-full shadow-lg animate-bounce cursor-pointer border-4 border-amber-400 focus:outline-none"></button>
            4
          </h1>
          <p class="mb-4 text-8xl tracking-tight font-anatol text-amber-50 md:text-4xl">Something's missing.</p>
          <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">Sorry, we can't find that page. You'll find lots to explore on the home page.</p>
          <button id="back-home-btn" class="mt-12 bg-amber-950 text-amber-400 border border-amber-400 border-b-4
      font-medium overflow-hidden relative px-8 py-3 rounded-md
      hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75
      outline-none duration-300 group w-full max-w-xs text-base md:text-xl">Back to Homepage</button>
        </div>
      </div>
    </section>
  `;

  const animationLayer = container.querySelector('#error-animation-layer') as HTMLDivElement;
  const bounceBtn = container.querySelector('#error-bounce-btn') as HTMLButtonElement;
  if (bounceBtn && animationLayer) {
    bounceBall(bounceBtn, animationLayer, 'bg-amber-400', 70);
  }
  const btn = container.querySelector('#back-home-btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/');
    });
  }
}