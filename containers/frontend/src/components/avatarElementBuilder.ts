import { CONFIG, CAMERA_SVG } from '../config/settings.config';

export class AvatarElementBuilder {
  // Create wrapper container for avatar with positioning
  static createAvatarWrapper(avatarImg: HTMLImageElement): HTMLElement {
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'relative inline-block';
    avatarImg.parentNode?.insertBefore(avatarWrapper, avatarImg);
    avatarWrapper.appendChild(avatarImg);
    return avatarWrapper;
  }

  // Create hidden file input for avatar upload
  static createFileInput(): HTMLInputElement {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = CONFIG.FILE_UPLOAD.acceptedString;
    fileInput.style.display = 'none';
    return fileInput;
  }

  // Create upload button with camera icon
  static createUploadButton(onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = this.getUploadButtonClasses();
    button.innerHTML = CAMERA_SVG;
    button.onclick = onClick;
    return button;
  }

  // Generate CSS classes for upload button styling
  private static getUploadButtonClasses(): string {
    return 'absolute bottom-[-40px] right-[-50px] w-20 h-20 bg-amber-400 border-2 border-amber-400 rounded-full flex items-center justify-center p-0 focus:outline-none transition group overflow-hidden hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed';
  }
}