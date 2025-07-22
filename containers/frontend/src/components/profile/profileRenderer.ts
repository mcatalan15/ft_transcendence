import i18n from '../../i18n';
import { HeaderTest } from '../generalComponents/testmenu';
import { LanguageSelector } from '../generalComponents/languageSelector';
import { PongBoxComponent } from '../pongBoxComponents/pongBox';
import { HeadersComponent } from '../pongBoxComponents/headersComponent';
import { CONFIG } from '../../config/settings.config';
import { setResizeHandler } from '../../views/profile';
import { ProfileContentRenderer } from './profileContentRenderer';
import { getApiUrl } from '../../config/api';
import { navigate } from '../../utils/router';

export class ProfileRenderer {
  private container: HTMLElement;
  private reloadCallback: () => void;
  private username?: string;
  private pongBoxElement!: HTMLElement;

  constructor(
    container: HTMLElement, 
    reloadCallback: () => void,
    username?: string
  ) {
    this.container = container;
    this.reloadCallback = reloadCallback;
    this.username = username;
  }

  private onRefresh = (): void => {
    this.reloadCallback();
  };

  public async render(): Promise<void> {
    try {
      this.container.innerHTML = '';
      
      const langSelector = new LanguageSelector(this.onRefresh).getElement();
      const testMenu = new HeaderTest().getElement();
      
      this.container.appendChild(langSelector);
      this.container.appendChild(testMenu);

      const svgHeader = this.createHeader();
      this.pongBoxElement = await this.createPongBox();
      const contentWrapper = this.createMainLayout(svgHeader, this.pongBoxElement);
      
      this.container.appendChild(contentWrapper);
    } catch (error) {
      console.error('Error rendering profile:', error);
    }
  }

  private createHeader(): HTMLElement {
    const lang = i18n.language || 'en';
    const svgHeader = new HeadersComponent({
      type: 'profile',
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

  private async createPongBox(): Promise<HTMLElement> {
    try {
      const response = await fetch(this.username ? 
        getApiUrl(`/profile/${this.username}`) : 
        getApiUrl('/profile'), {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
		if (response.status === 404) {
			navigate('/404');
			return document.createElement('div');
		}
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profileData = await response.json();
      const avatarUrl = `${getApiUrl('/profile/avatar')}/${profileData.userId}?t=${Date.now()}`;

      const contentRenderer = new ProfileContentRenderer(
        this.container,
        this.username
      );

      const content = await contentRenderer.render();
      const isOwnProfile = !this.username || this.username === sessionStorage.getItem('username');
      
      const pongBox = new PongBoxComponent({
        avatarUrl,
        nickname: profileData.username,
        mainContent: content,
        showStatus: !isOwnProfile
      } as any);

      const pongBoxElement = pongBox.getElement();
      pongBoxElement.style.marginTop = CONFIG.STYLES.pongBoxMarginTop;
      return pongBoxElement;
    } catch (error) {
      console.error('Error creating PongBox:', error);
      throw error;
    }
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