import i18n from '../../i18n';
import { HeaderTest } from '../generalComponents/testmenu';
import { LanguageSelector } from '../generalComponents/languageSelector';
import { PongBoxComponent } from '../profileComponents/pongBoxComponents/pongBox';
import { HeadersComponent } from '../profileComponents/pongBoxComponents/headersComponent';
import { CONFIG } from '../../config/settings.config';
import { setResizeHandler } from '../../views/settings';
import { SettingsFormsRenderer } from './settingsFormsRendered';
import { getApiUrl } from '../../config/api';
import { MessageManager } from '../../utils/messageManager';

export class SettingsRenderer {
  private container: HTMLElement;
  private reloadCallback: () => void;
  private updateProfileCallback: () => void;
  private pongBoxElement!: HTMLElement;

  constructor(
    container: HTMLElement, 
    reloadCallback: () => void,
    updateProfileCallback: () => void
  ) {
    this.container = container;
    this.reloadCallback = reloadCallback;
    this.updateProfileCallback = updateProfileCallback;
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
      MessageManager.showError('Error al cargar la configuración');
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
        throw new Error('Datos de usuario no disponibles');
      }

      const avatarUrl = `${getApiUrl('/profile/avatar')}/${userId}?t=${Date.now()}`;
      const formsRenderer = new SettingsFormsRenderer(
        this.container, 
        username, 
        userId
      );
      
      // Set the profile update handler if the class has this method
      (formsRenderer as any).setProfileUpdateHandler?.(this.handleProfileUpdate);

      const formsContent = formsRenderer.render();
      const pongBox = new PongBoxComponent({
        avatarUrl,
        nickname: username,
        mainContent: formsContent,
      });

      const pongBoxElement = pongBox.getElement();
      pongBoxElement.style.marginTop = CONFIG.STYLES.pongBoxMarginTop;
      return pongBoxElement;
    } catch (error) {
      console.error('Error creating PongBox:', error);
      MessageManager.showError('Error al cargar el perfil');
      throw error;
    }
  }

  private handleProfileUpdate = async () => {
    try {
      if (this.pongBoxElement) {
        this.updateProfileCallback();
        const newPongBox = await this.createPongBox();
        this.pongBoxElement.replaceWith(newPongBox);
        this.pongBoxElement = newPongBox;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      MessageManager.showError('Error al actualizar el perfil');
    }
  };

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

  /*
  private async handleNicknameUpdate(newNickname: string): Promise<void> {
    try {
      // Aquí tu lógica existente para actualizar el nickname
      
      // Después de actualizar exitosamente:
      this.updateProfileCallback(); // Actualiza el perfil
      MessageManager.showSuccess('Nickname actualizado correctamente');
    } catch (error) {
      console.error('Error updating nickname:', error);
      MessageManager.showError('Error al actualizar el nickname');
    }
  }*/

  getPongBoxElement(): HTMLElement {
    return this.pongBoxElement;
  }
}