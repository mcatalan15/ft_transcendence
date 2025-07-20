import i18n from '../i18n';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { HeaderTest } from '../components/generalComponents/testmenu';
import { HeadersComponent } from '../components/pongBoxComponents/headersComponent';
import { bounceBall } from '../components/generalComponents/ballComponent/bounceBall';

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

function createHeader(): HTMLElement {
  const lang = i18n.language || 'en';
  const svgHeader = new HeadersComponent({
    type: 'home',
    lang,
    style: {
      position: 'relative',
      top: '-300px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: !isFirefox ? '1818px' : '1800px',
      zIndex: '40'
    }
  }).getElement();
  
  return svgHeader;
}

export async function showHome(container: HTMLElement): Promise<void> {
  await i18n.loadNamespaces('chat');
  await i18n.changeLanguage(i18n.language);
  container.innerHTML = '';
      let clickCount = 0;

		const headerWrapper = new HeaderTest().getElement();
		headerWrapper.classList.add('row-start-1', 'w-full', 'z-30');
		container.appendChild(headerWrapper);

	  const langSelector = new LanguageSelector(() => showHome(container)).getElement();
	  container.appendChild(langSelector);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = `
      row-start-2 flex flex-col items-center justify-center w-full h-full
      bg-neutral-900 relative
    `.replace(/\s+/g, ' ').trim();
  
    const headerContainer = document.createElement('div');
    headerContainer.className = 'w-full relative';
    
    const svgHeader = createHeader();
    headerContainer.appendChild(svgHeader);
    contentWrapper.appendChild(headerContainer);

    container.appendChild(contentWrapper);
      
      const mainContainer = document.createElement('div');
      mainContainer.className = 'fixed inset-x-0 top-20 bottom-0 bg-neutral-900 text-amber-50 overflow-visible flex items-center justify-center';
      container.appendChild(mainContainer);
      
      const pingpongBox = document.createElement('div');
      pingpongBox.className = `
      w-full max-w-[1800px] h-auto md:h-[650px]
      mx-auto bg-neutral-900 border-l-[8px] border-r-[8px] border-b-[8px] md:border-l-[16px] md:border-r-[16px] md:border-b-[16px] border-amber-50
      flex flex-col md:flex-row 
      min-h-[650px]
      relative
      `.replace(/\s+/g, ' ').trim();
      
      const animationLayer = document.createElement('div');
      animationLayer.id = 'animation-layer';
      animationLayer.className = 'absolute inset-0 z-0 pointer-events-none';
      pingpongBox.appendChild(animationLayer);
      
      const gameContent = document.createElement('div');
      gameContent.className = 'relative h-full w-full flex flex-col z-10 items-center';
      
      const counterContainer = document.createElement('div');
      counterContainer.className = 'p-4 mt-6 overflow-visible flex justify-center w-full';
      
      const clickCounter = document.createElement('div');
      clickCounter.id = 'click-counter';
      clickCounter.className = 'text-8xl font-anatol text-amber-50 transform-gpu min-h-[4rem] flex items-center';
      clickCounter.textContent = '0';
      
      counterContainer.appendChild(clickCounter);
      gameContent.appendChild(counterContainer);
      
      const gameArea = document.createElement('div');
      gameArea.className = 'flex-grow flex items-center justify-center flex-col w-full h-full';
      
      const titleContainer = document.createElement('div');
      titleContainer.className = 'text-9xl md:text-9xl font-anatol flex items-center space-x-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      
      const pText = document.createElement('span');
      pText.textContent = 'P';
      
      const bounceBtn = document.createElement('button');
      bounceBtn.id = 'bounce-button';
      bounceBtn.className = 'w-12 h-12 md:w-16 md:h-16 bg-amber-400 rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300 cursor-pointer';
      
      const ngText = document.createElement('span');
      ngText.textContent = 'NG';
      
      titleContainer.appendChild(pText);
      titleContainer.appendChild(bounceBtn);
      titleContainer.appendChild(ngText);
      gameArea.appendChild(titleContainer);
      
      gameContent.appendChild(gameArea);
      pingpongBox.appendChild(gameContent);
      mainContainer.appendChild(pingpongBox);
      
      if (bounceBtn && animationLayer) {
        bounceBtn.addEventListener('click', () => {
          if (clickCount < 42) {
            clickCount++;
            clickCounter.textContent = clickCount.toString();
          }
        });

        bounceBall(bounceBtn, animationLayer, 'bg-amber-400', 42, true);
      }
    ;
}