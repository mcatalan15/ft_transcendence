import { SPINNER_SVG, CAMERA_SVG } from '../config/settings.config';
import { FileValidator } from '../utils/fileValidator';
import { MessageManager } from '../utils/messageManager';
import { ApiError } from '../types/settings.types';
import { getApiUrl } from '../config/api';

export class AvatarFileHandler {
  private userId: string;
  private getIsUploading: () => boolean;
  private setIsUploading: (value: boolean) => void;
  private refreshAvatar: () => void;

  constructor(
    userId: string,
    getIsUploading: () => boolean,
    setIsUploading: (value: boolean) => void,
    refreshAvatar: () => void
  ) {
    this.userId = userId;
    this.getIsUploading = getIsUploading;
    this.setIsUploading = setIsUploading;
    this.refreshAvatar = refreshAvatar;
  }

  setupFileUploadHandler(
    fileInput: HTMLInputElement, 
    avatarImg: HTMLImageElement, 
    uploadButton: HTMLButtonElement
  ): void {
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      if (!FileValidator.validateFile(file)) {
        fileInput.value = '';
        return;
      }

      await this.uploadAvatar(file, uploadButton);
    };
  }

  private async uploadAvatar(file: File, uploadButton: HTMLButtonElement): Promise<void> {
    const formData = new FormData();
    formData.append('avatar', file);

    this.setLoadingState(uploadButton, true);

    try {
      const response = await this.sendAvatarRequest(formData);
      await this.handleUploadResponse(response);
    } catch (error) {
      this.handleUploadError(error);
    } finally {
      this.setLoadingState(uploadButton, false);
    }
  }

  private setLoadingState(uploadButton: HTMLButtonElement, isLoading: boolean): void {
    this.setIsUploading(isLoading);
    uploadButton.disabled = isLoading;
    
    if (isLoading) {
      uploadButton.dataset.originalHTML = uploadButton.innerHTML;
      uploadButton.innerHTML = SPINNER_SVG;
    } else {
      uploadButton.innerHTML = uploadButton.dataset.originalHTML || CAMERA_SVG;
    }
  }

  private async sendAvatarRequest(formData: FormData): Promise<Response> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in sessionStorage');
    }

    return fetch(getApiUrl('/profile/avatar'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData
    });
  }

  private async handleUploadResponse(response: Response): Promise<void> {
    if (response.ok) {
      this.refreshAvatar();
      MessageManager.showSuccess('Avatar updated successfully!');
    } else {
      const errorMessage = await this.getErrorMessage(response);
      MessageManager.showError(errorMessage);
    }
  }

  private async getErrorMessage(response: Response): Promise<string> {
    let errorMessage = 'Failed to update avatar';
    
    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      if (response.status === 413) errorMessage = 'File too large';
      else if (response.status === 400) errorMessage = 'Invalid file format';
    }
    
    return errorMessage;
  }

  private handleUploadError(error: any): void {
    console.error('Avatar upload error:', error);
    MessageManager.showError('Network error. Please try again.');
  }
}