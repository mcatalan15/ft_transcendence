import i18n from '../../i18n';
import { HeaderTest } from '../generalComponents/testmenu';
import { LanguageSelector } from '../generalComponents/languageSelector';
import { PongBoxComponent } from '../pongBoxComponents/pongBox';
import { HeadersComponent } from '../pongBoxComponents/headersComponent';
import { CONFIG } from '../../config/settings.config';
import { setResizeHandler } from '../../views/history';
import { HistoryContentRenderer } from './historyContentRenderer';
import { getApiUrl } from '../../config/api';

export class HistoryRenderer {
  private container: HTMLElement;
  private onRefresh: () => void;
  private pongBoxElement!: HTMLElement;
  private username: string = '';

  constructor(container: HTMLElement, onRefresh: () => void, username: string) {
    this.container = container;
    this.onRefresh = onRefresh;
	this.username = username;
  }

  async render(): Promise<void> {
    this.container.innerHTML = '';
    
    const langSelector = new LanguageSelector(this.onRefresh).getElement();
    const testMenu = new HeaderTest().getElement();
    
    this.container.appendChild(langSelector);
    this.container.appendChild(testMenu);

    const svgHeader = this.createHeader();
    this.pongBoxElement = await this.createPongBox();
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

//   private async createPongBox(): Promise<HTMLElement> {
//     const currentUser = sessionStorage.getItem('username') || '';
// 	const username = this.username === currentUser ? currentUser : this.username;
// 	console.log(`Creating PongBox for user: ${username}`);
// 	const response = await fetch(`${getApiUrl('/profile')}/${username}`, {
// 		credentials: 'include',
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 	});
//     const data = await response.json();
// 	console.log(`User ID for ${username}:`, data.userId);
//     const avatarUrl = `${getApiUrl('/profile/avatar')}/${data.userId}?t=${Date.now()}`;

//     const contentRenderer = new HistoryContentRenderer(this.container, this.username);
//     const historyContent = contentRenderer.render();

//     const pongBox = new PongBoxComponent({
//       avatarUrl,
//       nickname: username,
//       mainContent: historyContent,
//     });
    
//     const pongBoxElement = pongBox.getElement();
//     pongBoxElement.style.marginTop = CONFIG.STYLES.pongBoxMarginTop;
//     return pongBoxElement;
//   }
	private async createPongBox(): Promise<HTMLElement> {
		try {
			const currentUser = sessionStorage.getItem('username') || '';
			const username = this.username === currentUser ? currentUser : this.username;
			console.log(`Creating PongBox for user: ${username}`);
			const token = sessionStorage.getItem('token');
			console.log('Render token: ', token);
			if (!token) {
				console.error('No token found in sessionStorage');
				navigate('/signin');
				throw new Error('No token found');
			}
			console.log('Fetching profile from:', getApiUrl(`/profile/${username}`));
			console.log('Request headers:', { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` });
			const response = await fetch(`${getApiUrl('/profile')}/${username}`, {
				headers: {
					'Accept': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				if (response.status === 401) {
					console.error('Unauthorized access, redirecting to signin');
					navigate('/signin');
					throw new Error('Unauthorized: Please sign in again');
				}
				if (response.status === 404) {
					throw new Error(`User not found: ${errorData.message || 'Unknown error'}`);
				}
				throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
			}
			const profileData = await response.json();
			console.log(`User ID for ${username}:`, profileData.id_user);
			// Pre-fetch avatar
			const avatarResponse = await fetch(`${getApiUrl('/profile/avatar')}/${profileData.id_user}?t=${Date.now()}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
			let avatarUrl = '/assets/avatarUnknownSquare.png'; // Default fallback
			if (avatarResponse.ok) {
				avatarUrl = URL.createObjectURL(await avatarResponse.blob());
			} else {
				const errorData = await avatarResponse.json().catch(() => ({}));
				console.error('Failed to fetch avatar:', errorData);
			}
			const contentRenderer = new HistoryContentRenderer(this.container, this.username);
			const historyContent = await contentRenderer.render(); // Await render
			const pongBox = new PongBoxComponent({
				avatarUrl,
				nickname: username,
				mainContent: historyContent,
			});
			const pongBoxElement = pongBox.getElement();
			pongBoxElement.style.marginTop = CONFIG.STYLES.pongBoxMarginTop;
			return pongBoxElement;
		} catch (error) {
			console.error('Error creating PongBox:', error);
			MessageManager.showError(`Error al cargar el historial: ${error.message}`);
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