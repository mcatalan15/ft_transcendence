import i18n from '../i18n';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { navigate } from '../utils/router';
import { bounceBall } from '../components/generalComponents/ballComponent/bounceBall';

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
              <button id="sign-in-btn" class="gaming-btn z-30 relative">
                ${i18n.t('signIn', { ns: 'landing' })}
              </button>
              <button id="sign-up-btn" class="gaming-btn z-30 relative">
                ${i18n.t('signUp', { ns: 'landing' })}
              </button>
            </div>
            <div class="flex-grow flex items-center justify-center">
              <div class="text-9xl md:text-9xl font-anatol flex items-center space-x-4 z-10">
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

      const signInBtn = landingDiv.querySelector('#sign-in-btn') as HTMLButtonElement;
      const signUpBtn = landingDiv.querySelector('#sign-up-btn') as HTMLButtonElement;
      [signInBtn, signUpBtn].forEach(btn => {
        if (!btn) return;
        btn.style.backgroundColor = 'transparent';
        btn.style.border = '2px solid #FFFBEB';
        btn.style.color = '#FFFBEB';
        btn.style.fontFamily = '"Roboto Mono", monospace';
        btn.style.fontWeight = 'bold';
        btn.style.fontSize = '16px';
        btn.style.textTransform = 'uppercase';
        btn.style.borderRadius = '0px';
        btn.style.padding = '12px 32px';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.3s ease';

        btn.addEventListener('mouseenter', () => {
          btn.style.backgroundColor = '#FFFBEB';
          btn.style.color = '#171717';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.backgroundColor = 'transparent';
          btn.style.color = '#FFFBEB';
        });
      });

      signInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('/signin');
      });

      signUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('/signup');
      });

      const animationLayer = landingDiv.querySelector('#animation-layer') as HTMLDivElement;
      const bounceBtn = landingDiv.querySelector('#bounce-button') as HTMLButtonElement;
      if (bounceBtn && animationLayer) {
        bounceBall(bounceBtn, animationLayer, 'bg-amber-400', 70);
      }
    });
}