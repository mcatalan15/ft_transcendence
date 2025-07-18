import i18n from '../../i18n';
import { HeaderTest } from '../generalComponents/testmenu';
import { LanguageSelector } from '../generalComponents/languageSelector';
import { PongBoxComponent } from '../pongBoxComponents/pongBox';
import { HeadersComponent } from '../pongBoxComponents/headersComponent';
import { CONFIG } from '../../config/settings.config';
import { setResizeHandler } from '../../views/settings';
import { SettingsFormsRenderer } from './settingsFormsRendered';
import { getApiUrl } from '../../config/api';
import { MessageManager } from '../../utils/messageManager';
import { getAvatarUrlWithToken } from "../../utils/avatar/avatarUtils";

export class SettingsRenderer {
  private container: HTMLElement;
  private reloadCallback: () => void;
  private pongBoxElement!: HTMLElement;

  constructor(
    container: HTMLElement, 
    reloadCallback: () => void,
  ) {
    this.container = container;
    this.reloadCallback = reloadCallback;
  }
  
  private onRefresh = (): void => {
    this.reloadCallback();
  };

  // Render complete settings page layout
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
      console.error('Error rendering settings:', error);
      MessageManager.showError(i18n.t("errors.loadingFailed", { ns: "settings" }) || "Error loading settings");
    }
  }

  // Create and configure SVG header component
  private createHeader(): HTMLElement {
    const lang = i18n.language || 'en';
    const svgHeader = new HeadersComponent({
      type: 'settings',
      lang
    }).getElement();

    this.setupResponsiveMargin(svgHeader);
    return svgHeader;
  }

  // Setup responsive margin adjustments for header
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

  // Create and configure pong box component with forms
  private async createPongBox(): Promise<HTMLElement> {
    try {
      const username = sessionStorage.getItem('username') || '';
      const userId = sessionStorage.getItem('userId') || '';
      
      if (!username || !userId) {
        throw new Error(i18n.t("errors.userNotFound", { ns: "settings" }) || "User not found");
      }

      const avatarUrl = getAvatarUrlWithToken(userId);
      const formsRenderer = new SettingsFormsRenderer(
        this.container, 
        username, 
        userId
      );
      
      const formsContent = formsRenderer.render();
      const pongBox = new PongBoxComponent({
        avatarUrl,
        nickname: username,
        mainContent: formsContent,
        showCameraButton: true
      });

      const pongBoxElement = pongBox.getElement();
      pongBoxElement.style.marginTop = CONFIG.STYLES.pongBoxMarginTop;
      return pongBoxElement;
    } catch (error) {
      console.error('Error creating PongBox:', error);
      MessageManager.showError(i18n.t("errors.loadingFailed", { ns: "settings" }) || "Error loading settings");
      throw error;
    }
  }

  // Create main layout structure with header and pong box
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