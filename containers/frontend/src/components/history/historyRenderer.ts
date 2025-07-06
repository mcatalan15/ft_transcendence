import i18n from '../../i18n';
import { HeaderTest } from '../generalComponents/testmenu';
import { LanguageSelector } from '../generalComponents/languageSelector';
import { PongBoxComponent } from '../profileComponents/pongBoxComponents/pongBox';
import { HeadersComponent } from '../profileComponents/pongBoxComponents/headersComponent';
import { CONFIG } from '../../config/settings.config';
import { setResizeHandler } from '../../views/history';
import { HistoryContentRenderer } from './historyContentRenderer';
import { getApiUrl } from '../../config/api';

export class HistoryRenderer {
  private container: HTMLElement;
  private onRefresh: () => void;
  private pongBoxElement!: HTMLElement;

  constructor(container: HTMLElement, onRefresh: () => void) {
    this.container = container;
    this.onRefresh = onRefresh;
  }

  render(): void {
    this.container.innerHTML = '';
    
    const langSelector = new LanguageSelector(this.onRefresh).getElement();
    const testMenu = new HeaderTest().getElement();
    
    this.container.appendChild(langSelector);
    this.container.appendChild(testMenu);

    const svgHeader = this.createHeader();
    this.pongBoxElement = this.createPongBox();
    const contentWrapper = this.createMainLayout(svgHeader, this.pongBoxElement);
    
    this.container.appendChild(contentWrapper);
  }

  private createHeader(): HTMLElement {
    const lang = i18n.language || 'en';
    const svgHeader = new HeadersComponent({
      type: 'history',
      lang
    }).getElement();

    this.setupResponsiveMargin(svgHeader);
    return svgHeader;
  }

  private setupResponsiveMargin(svgHeader: HTMLElement): void {
    const updateSvgMargin = () => {
      const isMobile = window.innerWidth < CONFIG.BREAKPOINTS.mobile;
      const multiplier = isMobile ? CONFIG.MULTIPLIERS.mobile : CONFIG.MULTIPLIERS.desktop;
      const border = isMobile ? CONFIG.BORDER_VALUES.mobile : CONFIG.BORDER_VALUES.desktop;
      svgHeader.style.marginTop = `-${border * multiplier}px`;
    };
    
    updateSvgMargin();
    setResizeHandler(updateSvgMargin);
    window.addEventListener('resize', updateSvgMargin);
  }

  private createPongBox(): HTMLElement {
    const username = sessionStorage.getItem('username') || '';
    const userId = sessionStorage.getItem('userId') || 'defaultUserId';
    const avatarUrl = `${getApiUrl('/profile/avatar')}/${userId}?t=${Date.now()}`;

    const contentRenderer = new HistoryContentRenderer(this.container);
    const historyContent = contentRenderer.render();

    const pongBox = new PongBoxComponent({
      avatarUrl,
      nickname: username,
      mainContent: historyContent,
    });
    
    const pongBoxElement = pongBox.getElement();
    pongBoxElement.style.marginTop = CONFIG.STYLES.pongBoxMarginTop;
    return pongBoxElement;
  }

  private createMainLayout(svgHeader: HTMLElement, pongBoxElement: HTMLElement): HTMLElement {
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex flex-col items-center justify-center w-full h-full bg-neutral-900';

    const mainColumn = document.createElement('div');
    mainColumn.className = 'flex flex-col items-center w-full';
    
    const headerPongBoxWrapper = document.createElement('div');
    headerPongBoxWrapper.className = 'relative flex flex-col items-center w-full';
    
    headerPongBoxWrapper.appendChild(svgHeader);
    headerPongBoxWrapper.appendChild(pongBoxElement);
    mainColumn.appendChild(headerPongBoxWrapper);
    contentWrapper.appendChild(mainColumn);

    return contentWrapper;
  }

  getPongBoxElement(): HTMLElement {
    return this.pongBoxElement;
  }
}