import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';

export function showHome(container: HTMLElement) {
  i18n
    .loadNamespaces('home')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      container.innerHTML = '';

      const header = new Header().getElement();
      const langSelector = new LanguageSelector(() => translateDOM()).getElement();

      // MAIN container con animación
      const main = document.createElement('main');
      main.className = 'flex flex-col items-center justify-center h-screen bg-white';

      main.innerHTML = `
        <div id="pingpong" class="flex items-center justify-center space-x-6">
          <div id="ping" class="text-6xl font-bold text-black cursor-pointer opacity-0 translate-x-[-50px] transition-all duration-700">
            PING
          </div>
          <div id="ball" class="w-6 h-6 bg-pink-500 rounded-full scale-0 transition-transform duration-700"></div>
          <div id="pong" class="text-6xl font-bold text-black cursor-pointer opacity-0 translate-x-[50px] transition-all duration-700">
            PONG
          </div>
        </div>
      `;

      container.appendChild(header);
      container.appendChild(langSelector);
      container.appendChild(main);

      translateDOM();

      // Animaciones progresivas
      const ping = main.querySelector('#ping') as HTMLDivElement;
      const pong = main.querySelector('#pong') as HTMLDivElement;
      const ball = main.querySelector('#ball') as HTMLDivElement;

      setTimeout(() => {
        ping.classList.replace('opacity-0', 'opacity-100');
        ping.classList.replace('translate-x-[-50px]', 'translate-x-0');
      }, 200);

      setTimeout(() => {
        ball.classList.replace('scale-0', 'scale-100');
      }, 800);

      setTimeout(() => {
        pong.classList.replace('opacity-0', 'opacity-100');
        pong.classList.replace('translate-x-[50px]', 'translate-x-0');
      }, 1200);

      // Eventos de clic con console.log
      ping.addEventListener('click', () => {
        console.log('PING clicked'); // Aquí pondrás navigate('/ping') más adelante
      });

      pong.addEventListener('click', () => {
        console.log('PONG clicked'); // Aquí pondrás navigate('/pong') más adelante
      });
    });
}
