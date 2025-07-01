import i18n from '../i18n';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';

export function showLanding(container: HTMLElement): void {
  
  container.innerHTML = '';

  i18n
    .loadNamespaces('landing')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      const landingDiv = document.createElement('div');
      landingDiv.innerHTML = `
        <div class="fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden">
          <div id="animation-layer" class="fixed inset-0 z-0 pointer-events-none"></div>
          <div class="relative h-full flex flex-col">
            <div class="pt-6 w-full flex justify-center gap-x-4 z-30">
              <button id="sign-in-btn" class="bg-amber-50 text-neutral-900 px-4 py-2 rounded hover:bg-amber-100 transition-colors z-30 relative">
                ${i18n.t('signIn', { ns: 'landing' })}
              </button>
              <button id="sign-up-btn" class="border border-amber-50 text-amber-50 px-4 py-2 rounded hover:bg-neutral-800 transition-colors z-30 relative">
                ${i18n.t('signUp', { ns: 'landing' })}
              </button>
            </div>
            <div class="flex-grow flex items-center justify-center">
              <div class="text-8xl md:text-9xl font-anatol flex items-center space-x-4 z-10">
                <span>P</span>
                <button id="bounce-button" class="w-12 h-12 md:w-16 md:h-16 bg-amber-400 rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300 cursor-pointer z-10"></button>
                <span>NG</span>
              </div>
            </div>
            <div class="h-16"></div>
          </div>
        </div>
      `;

      container.appendChild(landingDiv);

      const langSelector = new LanguageSelector(() => {
        const signInBtn = landingDiv.querySelector('#sign-in-btn') as HTMLButtonElement;
        const signUpBtn = landingDiv.querySelector('#sign-up-btn') as HTMLButtonElement;
        signInBtn.textContent = i18n.t('signIn', { ns: 'landing' });
        signUpBtn.textContent = i18n.t('signUp', { ns: 'landing' });
      });

      landingDiv.querySelector('.flex-col')?.appendChild(langSelector.getElement());

      const animationLayer = landingDiv.querySelector('#animation-layer') as HTMLDivElement;
      const bounceBtn = landingDiv.querySelector('#bounce-button') as HTMLButtonElement;
      const signInBtn = landingDiv.querySelector('#sign-in-btn') as HTMLButtonElement;
      const signUpBtn = landingDiv.querySelector('#sign-up-btn') as HTMLButtonElement;

      signInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('/signin');
      });

      signUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('/signup');
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

        if (balls.length > 70) {
          const oldest = balls.shift();
          if (oldest) animationLayer.removeChild(oldest);
        }
      });
    });
}
