import i18n from '../i18n';

export function showLanding(container: HTMLElement): void {
  const landingDiv = document.createElement('div');
  landingDiv.innerHTML = `
    <div class="fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden" id="landing-wrapper">
      <div id="animation-layer" class="fixed inset-0 z-0 pointer-events-none"></div>

      <div class="relative h-full flex flex-col">
        <!-- Botones arriba -->
        <div class="pt-6 w-full flex justify-center gap-x-4 z-30">
          <button id="sign-in-btn"
            class="bg-amber-50 text-neutral-900 px-4 py-2 rounded hover:bg-amber-100 transition-colors z-30 relative">
            Sign in
          </button>
          <button id="sign-up-btn"
            class="border border-amber-50 text-amber-50 px-4 py-2 rounded hover:bg-neutral-800 transition-colors z-30 relative">
            Sign up
          </button>
        </div>

        <!-- Texto central -->
        <div class="flex-grow flex items-center justify-center">
          <div class="text-8xl md:text-9xl font-anatol flex items-center space-x-4 z-10">
            <span>P</span>
            <button id="bounce-button"
              class="w-12 h-12 md:w-16 md:h-16 bg-amber-400 rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300 cursor-pointer z-10"
              title="">
            </button>
            <span>NG</span>
          </div>
        </div>

        <!-- Selector de idioma tipo MACBA -->
        <div class="absolute bottom-4 w-full flex justify-center z-30">
          <div class="relative inline-block text-left">
            <button id="language-btn"
              class="inline-flex items-center px-4 py-2 bg-neutral-800 text-amber-50 rounded hover:bg-neutral-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span id="current-lang">${(i18n.language || 'en').toUpperCase()}</span>
            </button>
            <ul id="lang-menu"
              class="hidden absolute bottom-full mb-2 w-full bg-neutral-800 border border-neutral-700 rounded shadow text-center">
              <li class="cursor-pointer hover:bg-neutral-700 px-4 py-2" data-lang="en">English</li>
              <li class="cursor-pointer hover:bg-neutral-700 px-4 py-2" data-lang="es">Español</li>
              <li class="cursor-pointer hover:bg-neutral-700 px-4 py-2" data-lang="fr">Français</li>
            </ul>
          </div>
        </div>

        <div class="h-16"></div>
      </div>
    </div>
  `;

  container.appendChild(landingDiv);

  const animationLayer = landingDiv.querySelector('#animation-layer') as HTMLDivElement;
  const bounceBtn = landingDiv.querySelector('#bounce-button') as HTMLButtonElement;
  const signInBtn = landingDiv.querySelector('#sign-in-btn') as HTMLButtonElement;
  const signUpBtn = landingDiv.querySelector('#sign-up-btn') as HTMLButtonElement;

  signInBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = '/signin';
  });

  signUpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = '/signup';
  });

  const balls: HTMLDivElement[] = [];

  bounceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = bounceBtn.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const ball = document.createElement('div');
    ball.className = 'w-4 h-4 bg-amber-400 rounded-full absolute z-0 pointer-events-none';
    ball.style.left = `${startX}px`;
    ball.style.top = `${startY}px`;

    animationLayer.appendChild(ball);

    let x = startX;
    let y = startY;
    let dx = (Math.random() - 0.5) * 6;
    let dy = (Math.random() - 0.5) * 6;

    const updatePosition = () => {
      const maxX = window.innerWidth - 16;
      const maxY = window.innerHeight - 16;

      x += dx;
      y += dy;

      if (x <= 0 || x >= maxX) dx = -dx;
      if (y <= 0 || y >= maxY) dy = -dy;

      ball.style.left = `${x}px`;
      ball.style.top = `${y}px`;

      requestAnimationFrame(updatePosition);
    };

    updatePosition();
    balls.push(ball);

    if (balls.length > 50) {
      const oldest = balls.shift();
      if (oldest) animationLayer.removeChild(oldest);
    }
  });

  // Idioma
  const langBtn = landingDiv.querySelector('#language-btn') as HTMLButtonElement;
  const langMenu = landingDiv.querySelector('#lang-menu') as HTMLUListElement;
  const currentLang = landingDiv.querySelector('#current-lang') as HTMLSpanElement;

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('hidden');
  });

  langMenu.querySelectorAll('li').forEach((el) => {
    el.addEventListener('click', (e) => {
      const selectedLang = (e.target as HTMLElement).dataset.lang!;
      i18n.changeLanguage(selectedLang).then(() => {
        currentLang.textContent = selectedLang.toUpperCase();
        langMenu.classList.add('hidden');

        // Actualiza textos
        signInBtn.textContent = i18n.t('signIn');
        signUpBtn.textContent = i18n.t('signUp');
      });

      localStorage.setItem('lng', selectedLang);
    });
  });

  document.addEventListener('click', () => {
    langMenu.classList.add('hidden');
  });
}
