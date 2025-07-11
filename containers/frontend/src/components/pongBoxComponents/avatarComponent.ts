import { CAMERA_SVG, CAMERA_BUTTON_STYLES, STATUS_BUTTON_STYLES } from '../../../config/settings.config';
import { getApiUrl } from '../../../config/api';

export class AvatarComponent {
  private element: HTMLDivElement;
  private avatarImg: HTMLImageElement;

  constructor(avatarUrl: string, nickname: string, showStatus: boolean = false, showCameraButton: boolean = false) {
    this.element = document.createElement('div');
    this.element.className = 'flex flex-col items-center justify-center';

    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'relative inline-block';

    const avatarFrame = document.createElement('div');
    avatarFrame.className = 'relative p-2 border border-4 border-amber-50 shadow-2xl bg-transparent w-full max-w-[500px] flex items-center justify-center';

    this.avatarImg = document.createElement('img');
    this.avatarImg.src = avatarUrl;
    this.avatarImg.alt = 'Profile';
    this.avatarImg.className = 'w-full aspect-square object-cover transition-all duration-300 max-w-xs md:max-w-md';

    avatarFrame.appendChild(this.avatarImg);

    // Extraer userId del avatarUrl
    const match = avatarUrl.match(/\/avatar\/([^/?]+)/);
    const userId = match ? match[1] : null;

    if (showStatus && userId) {
      const statusButton = document.createElement('div');
      Object.assign(statusButton.style, STATUS_BUTTON_STYLES.base);
      avatarContainer.appendChild(statusButton); // Cambiado de avatarFrame a avatarContainer
      
      this.updateOnlineStatus(userId, statusButton);
      setInterval(() => this.updateOnlineStatus(userId, statusButton), 30000);
    }

    if (showCameraButton) {
      const cameraButton = document.createElement('button');
      Object.assign(cameraButton.style, CAMERA_BUTTON_STYLES.base);
      cameraButton.innerHTML = CAMERA_SVG;
      
      cameraButton.addEventListener('mouseenter', () => {
        Object.assign(cameraButton.style, CAMERA_BUTTON_STYLES.hover);
      });
      
      cameraButton.addEventListener('mouseleave', () => {
        Object.assign(cameraButton.style, CAMERA_BUTTON_STYLES.base);
      });
      
      cameraButton.onclick = this.handleImageUpload;
      avatarFrame.appendChild(cameraButton);
    }

    avatarContainer.appendChild(avatarFrame);
    this.element.appendChild(avatarContainer);

    const nicknameSpan = document.createElement('span');
    nicknameSpan.className = 'mt-4 text-amber-50 text-4xl font-anatol tracking-wide break-all text-center w-full max-w-[500px] pl-2';
    nicknameSpan.textContent = nickname;
    this.element.appendChild(nicknameSpan);
  }

  private handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('avatar', file);
        try {
          const response = await fetch(getApiUrl('/profile/avatar'), {
            method: 'POST',
            credentials: 'include',
            body: formData
          });
          if (response.ok) {
            // Actualizar la imagen usando userId
            const match = this.avatarImg.src.match(/\/avatar\/([^/?]+)/);
            const userId = match ? match[1] : sessionStorage.getItem('userId');
            if (userId) {
              // Forzar recarga de la imagen evitando caché
              const timestamp = Date.now();
              this.avatarImg.src = `${getApiUrl('/profile/avatar')}/${userId}?t=${timestamp}`;
            }
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
        }
      }
    };
  };

  private async updateOnlineStatus(userId: string, statusButton: HTMLElement): Promise<void> {
    try {
      const response = await fetch(getApiUrl(`/profile/status/${userId}`), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isOnline) {
          // Usuario en línea - verde
          Object.assign(statusButton.style, {
            ...STATUS_BUTTON_STYLES.base,
            backgroundColor: '#22c55e', // verde
            transition: 'background-color 0.3s ease'
          });
          statusButton.title = 'Online';
        } else {
          // Usuario desconectado - gris
          Object.assign(statusButton.style, {
            ...STATUS_BUTTON_STYLES.base,
            backgroundColor: '#6b7280', // gris
            transition: 'background-color 0.3s ease'
          });
          statusButton.title = 'Offline';
        }
      }
    } catch (error) {
      console.error('Error checking online status:', error);
      // En caso de error, mostrar como desconectado
      Object.assign(statusButton.style, STATUS_BUTTON_STYLES.base);
      statusButton.title = 'Status unknown';
    }
  }

  getElement() {
    return this.element;
  }
}
