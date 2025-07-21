import { CONFIG } from '../config/settings.config';
import { MessageManager } from './messageManager';

export class FileValidator {
  static validateFile(file: File): boolean {
    if (!this.validateFileSize(file)) {
      return false;
    }

    if (!this.validateFileType(file)) {
      return false;
    }

    return true;
  }

  private static validateFileSize(file: File): boolean {
    if (file.size > CONFIG.FILE_UPLOAD.maxSize) {
      MessageManager.showError('Image too large (max 2MB)');
      return false;
    }
    return true;
  }

  private static validateFileType(file: File): boolean {
    if (!CONFIG.FILE_UPLOAD.acceptedTypes.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      MessageManager.showError('Invalid file type. Please select a JPEG or PNG image.');
      return false;
    }
    return true;
  }
}