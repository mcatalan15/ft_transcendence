import { AvatarElementBuilder } from './avatarElementBuilder';
import { AvatarFileHandler } from './avatarFileHandler';
import { getApiUrl } from '../config/api';

export class AvatarUploader {
  private pongBoxElement: HTMLElement;
  private userId: string;
  private isUploading: boolean = false;

  constructor(pongBoxElement: HTMLElement, userId: string) {
    this.pongBoxElement = pongBoxElement;
    this.userId = userId || sessionStorage.getItem('userId') || 'defaultUserId';
  }

  setup(): void {
    const avatarImg = this.pongBoxElement.querySelector('img') as HTMLImageElement;
    if (!avatarImg) return;

    this.setAvatarSource(avatarImg);
    const elements = this.createAvatarElements(avatarImg);
    this.appendAvatarElements(elements);
    this.setupFileHandler(elements, avatarImg);
  }

  private createAvatarElements(avatarImg: HTMLImageElement) {
    const avatarWrapper = AvatarElementBuilder.createAvatarWrapper(avatarImg);
    const fileInput = AvatarElementBuilder.createFileInput();
    const uploadButton = AvatarElementBuilder.createUploadButton(() => {
      if (!this.isUploading) {
        fileInput.click();
      }
    });
    
    return { avatarWrapper, fileInput, uploadButton };
  }

  private appendAvatarElements(elements: any): void {
    elements.avatarWrapper.appendChild(elements.fileInput);
    elements.avatarWrapper.appendChild(elements.uploadButton);
  }

  private setAvatarSource(avatarImg: HTMLImageElement): void {
    avatarImg.src = `${getApiUrl('/profile/avatar')}/${this.userId}?t=${Date.now()}`;
  }

  private setupFileHandler(elements: any, avatarImg: HTMLImageElement): void {
    if (!elements || !elements.fileInput || !elements.uploadButton) {
      console.error('Invalid elements provided to setupFileHandler.');
      return;
    }

    if (!avatarImg) {
      console.error('Avatar image element is missing.');
      return;
    }

    try {
      const fileHandler = new AvatarFileHandler(
        (value: boolean) => { this.isUploading = value; },
        () => this.setAvatarSource(avatarImg)
      );
      fileHandler.setupFileUploadHandler(
        elements.fileInput,
        elements.uploadButton
      );
    } catch (error) {
      console.error('Error setting up file handler:', error);
    }
  }
}