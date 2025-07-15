import { navigate } from '../utils/router';
import { bounceBall } from '../components/generalComponents/ballComponent/bounceBall';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import i18n from '../i18n';

export async function show404(container: HTMLElement): Promise<void> {
  await i18n.loadNamespaces('404');
  await i18n.changeLanguage(i18n.language);

  const title = i18n.t('title', { ns: '404'});
  const description = i18n.t('description', { ns: '404' });
  const backBtnText = i18n.t('backHome', { ns: '404' });

  container.innerHTML = '';

  const langSelector = new LanguageSelector(() => show404(container)).getElement();
  container.appendChild(langSelector);

  const section = document.createElement('section');
  section.className = 'bg-neutral-900 min-h-screen flex items-center justify-center';
  section.innerHTML = `
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
      <div class="mx-auto max-w-screen-sm text-center relative">
        <div id="error-animation-layer" class="fixed inset-0 z-0 pointer-events-none"></div>
        <h1 class="mb-4 text-9xl tracking-tight font-anatol text-amber-50 flex items-center justify-center gap-2 relative z-10">
          4
          <button id="error-bounce-btn" class="inline-block w-16 h-16 bg-amber-400 rounded-full shadow-lg animate-bounce cursor-pointer border-4 border-amber-400 focus:outline-none"></button>
          4
        </h1>
        <p class="mb-4 text-8xl tracking-tight font-anatol text-amber-50 md:text-4xl">${title}</p>
        <p class="mb-4 text-lg font-light text-gray-500">${description}</p>
        <button id="back-home-btn" class="mt-12 w-full max-w-xs text-base md:text-xl">${backBtnText}</button>
      </div>
    </div>
  `;
  container.appendChild(section);

  const backBtn = section.querySelector('#back-home-btn') as HTMLButtonElement;
  if (backBtn) {
    backBtn.style.backgroundColor = 'transparent';
    backBtn.style.border = '2px solid #FFFBEB';
    backBtn.style.color = '#FFFBEB';
    backBtn.style.fontFamily = '"Roboto Mono", monospace';
    backBtn.style.fontWeight = 'bold';
    backBtn.style.fontSize = '16px';
    backBtn.style.textTransform = 'uppercase';
    backBtn.style.borderRadius = '0px';
    backBtn.style.padding = '16px 0';
    backBtn.style.cursor = 'pointer';
    backBtn.style.transition = 'all 0.3s ease';
    backBtn.style.marginTop = '48px';

    backBtn.addEventListener('mouseenter', () => {
      backBtn.style.backgroundColor = '#FFFBEB';
      backBtn.style.color = '#171717';
    });
    backBtn.addEventListener('mouseleave', () => {
      backBtn.style.backgroundColor = 'transparent';
      backBtn.style.color = '#FFFBEB';
    });

    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/home');
      return;
    });
  }

  const animationLayer = section.querySelector('#error-animation-layer') as HTMLDivElement;
  const bounceBtn = section.querySelector('#error-bounce-btn') as HTMLButtonElement;
  if (bounceBtn && animationLayer) {
    bounceBall(bounceBtn, animationLayer, 'bg-amber-400', 70);
  }
}