import { CONFIG } from '../config/settings.config';
import { AvatarElementBuilder } from './avatarElementBuilder';
import { AvatarFileHandler } from './avatarFileHandler';
import { getApiUrl } from '../config/api';
import { getAvatarUrlWithToken } from '../utils/avatar/avatarUtils';


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
    avatarImg.src = getAvatarUrlWithToken(this.userId);
  }

  private setupFileHandler(elements: any, avatarImg: HTMLImageElement): void {
    const fileHandler = new AvatarFileHandler(
      this.userId,
      () => this.isUploading,
      (value: boolean) => { this.isUploading = value; },
      () => this.setAvatarSource(avatarImg)
    );
    
    fileHandler.setupFileUploadHandler(
      elements.fileInput, 
      avatarImg, 
      elements.uploadButton
    );
  }
}