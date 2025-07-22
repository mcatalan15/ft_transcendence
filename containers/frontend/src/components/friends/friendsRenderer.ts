import i18n from "../../i18n";
import { HeaderTest } from "../generalComponents/testmenu";
import { LanguageSelector } from "../generalComponents/languageSelector";
import { PongBoxComponent } from "../pongBoxComponents/pongBox";
import { HeadersComponent } from "../pongBoxComponents/headersComponent";
import { CONFIG } from "../../config/settings.config";
import { setResizeHandler } from "../../views/friends";
import { FriendsContentRenderer } from "./friendsContentRenderer";
import { getApiUrl } from "../../config/api";

export class FriendsRenderer {
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
      type: 'friends',
      lang
    }).getElement();

    this.setupResponsiveMargin(svgHeader);
    return svgHeader;
  }

  private setupResponsiveMargin(svgHeader: HTMLElement): void {
    const updateSvgMargin = () => {
      const multiplier = CONFIG.MULTIPLIERS.desktop;
      const border = CONFIG.BORDER_VALUES.desktop;
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

    const friendsContentContainer = document.createElement('div');
    friendsContentContainer.id = 'friends-content-container';
    friendsContentContainer.className = 'w-full h-full';
    
    const contentRenderer = new FriendsContentRenderer();
    const friendsContent = contentRenderer.render();

    const pongBox = new PongBoxComponent({
      avatarUrl,
      nickname: username,
      mainContent: friendsContent,
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