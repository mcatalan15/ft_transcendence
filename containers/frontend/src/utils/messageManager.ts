import { CONFIG } from '../config/settings.config';

export class MessageManager {
  private static readonly CONTAINER_ID = 'messageContainer';
  private static readonly DISPLAY_TIME = CONFIG.TRANSITIONS.messageDisplayTime;
  private static readonly FADE_OUT_DELAY = CONFIG.TRANSITIONS.fadeOutDelay;

  static createContainer(container: HTMLElement): void {
    if (!document.getElementById(this.CONTAINER_ID)) {
      const messageContainer = document.createElement('div');
      messageContainer.id = this.CONTAINER_ID;
      messageContainer.className = 'fixed top-20 right-4 z-50 space-y-2';
      container.appendChild(messageContainer);
    }
  }

  static showSuccess(message: string): void {
    this.showMessage(message, 'success');
  }

  static showError(message: string): void {
    this.showMessage(message, 'error');
  }

  private static showMessage(message: string, type: 'success' | 'error'): void {
    const messageContainer = this.getOrCreateContainer();
    const messageDiv = this.createMessageElement(message, type);
    
    messageContainer.appendChild(messageDiv);
    this.animateMessageEntry(messageDiv);
    this.scheduleRemoval(messageDiv, messageContainer);
  }

  private static getOrCreateContainer(): HTMLElement {
    let container = document.getElementById(this.CONTAINER_ID);
    if (!container) {
      container = this.createMessageContainer();
    }
    return container;
  }

  private static createMessageContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = this.CONTAINER_ID;
    container.className = 'fixed top-20 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
  }

  private static createMessageElement(message: string, type: 'success' | 'error'): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = this.getMessageClasses(type);
    messageDiv.textContent = message;
    messageDiv.style.cursor = 'pointer';
    messageDiv.style.fontFamily = '"Roboto Mono", monospace';
    messageDiv.style.fontSize = '14px';
    
    messageDiv.onclick = () => {
      this.removeMessage(messageDiv);
    };
    
    return messageDiv;
  }

  private static getMessageClasses(type: 'success' | 'error'): string {
    const baseClasses = 'px-4 py-3 shadow-lg max-w-xs text-center transition-all duration-300 transform translate-x-full opacity-0';
    const typeClasses = type === 'success' 
      ? 'bg-lime-400 text-white border-l-4 border-lime-500' 
      : 'bg-red-500 text-white border-l-4 border-red-600';
    
    return `${baseClasses} ${typeClasses}`;
  }

  private static animateMessageEntry(messageDiv: HTMLElement): void {
    requestAnimationFrame(() => {
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateX(0)';
    });
  }

  private static scheduleRemoval(messageDiv: HTMLElement, container: HTMLElement): void {
    setTimeout(() => {
      this.removeMessage(messageDiv, container);
    }, this.DISPLAY_TIME);
  }

  private static removeMessage(messageDiv: HTMLElement, container?: HTMLElement): void {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      this.finalizeMessageRemoval(messageDiv, container);
    }, this.FADE_OUT_DELAY);
  }

  private static finalizeMessageRemoval(messageDiv: HTMLElement, container?: HTMLElement): void {
    messageDiv.remove();
    
    const messageContainer = container || document.getElementById(this.CONTAINER_ID);
    if (messageContainer && messageContainer.childElementCount === 0) {
      messageContainer.remove();
    }
  }
}