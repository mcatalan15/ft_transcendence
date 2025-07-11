import { navigate } from './router';
import { MessageManager } from './messageManager';
import { AvatarUploader } from '../components/avatarUploader';
import { UserData } from '../types/settings.types';
import { getApiUrl } from '../config/api';

export class ProfileLoader {
  static async loadUserProfile(pongBoxElement: HTMLElement): Promise<void> {
    try {
      const response = await this.fetchUserProfile();
      const data = await this.handleProfileResponse(response);
      
      this.updateUserInfo(pongBoxElement, data);
      new AvatarUploader(pongBoxElement, data.id).setup();
    } catch (error) {
      this.handleProfileError(error);
    }
  }

  private static async fetchUserProfile(): Promise<Response> {
    return fetch(getApiUrl('/profile'), {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  private static async handleProfileResponse(response: Response): Promise<UserData> {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private static updateUserInfo(pongBoxElement: HTMLElement, data: UserData): void {
    const nicknameEl = pongBoxElement.querySelector('span.text-amber-50');
    if (nicknameEl) {
      nicknameEl.textContent = data.username;
    }
  }

  private static handleProfileError(error: any): void {
    console.error('Error fetching profile:', error);
    MessageManager.showError('Error al cargar el perfil');
    navigate('/home');
  }
}