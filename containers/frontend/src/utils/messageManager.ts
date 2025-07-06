import { CONFIG } from '../config/settings.config';

export class MessageManager {
  private static readonly CONTAINER_ID = 'messageContainer';
  private static readonly DISPLAY_TIME = CONFIG.TRANSITIONS.messageDisplayTime;
  private static readonly FADE_OUT_DELAY = CONFIG.TRANSITIONS.fadeOutDelay;

  // Create message container in specified element
  static createContainer(container: HTMLElement): void {
    if (!document.getElementById(this.CONTAINER_ID)) {
      const messageContainer = document.createElement('div');
      messageContainer.id = this.CONTAINER_ID;
      messageContainer.className = 'fixed top-20 right-4 z-50 space-y-2';
      container.appendChild(messageContainer);
    }
  }

  // Show success message to user
  static showSuccess(message: string): void {
    this.showMessage(message, 'success');
  }

  // Show error message to user
  static showError(message: string): void {
    this.showMessage(message, 'error');
  }

  // Display message with specified type and styling
  private static showMessage(message: string, type: 'success' | 'error'): void {
    const messageContainer = this.getOrCreateContainer();
    const messageDiv = this.createMessageElement(message, type);
    
    messageContainer.appendChild(messageDiv);
    this.animateMessageEntry(messageDiv);
    this.scheduleRemoval(messageDiv, messageContainer);
  }

  // Get existing container or create new one
  private static getOrCreateContainer(): HTMLElement {
    let container = document.getElementById(this.CONTAINER_ID);
    if (!container) {
      container = this.createMessageContainer();
    }
    return container;
  }

  // Create message container and append to body
  private static createMessageContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = this.CONTAINER_ID;
    container.className = 'fixed top-20 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
  }

  // Create styled message element
  private static createMessageElement(message: string, type: 'success' | 'error'): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = this.getMessageClasses(type);
    messageDiv.textContent = message;
    messageDiv.style.cursor = 'pointer';
    
    messageDiv.onclick = () => {
      this.removeMessage(messageDiv);
    };
    
    return messageDiv;
  }

  // Get CSS classes based on message type
  private static getMessageClasses(type: 'success' | 'error'): string {
    const baseClasses = 'px-4 py-3 rounded-lg shadow-lg max-w-xs text-center transition-all duration-300 transform translate-x-full opacity-0';
    const typeClasses = type === 'success' 
      ? 'bg-green-500 text-white border-l-4 border-green-600' 
      : 'bg-red-500 text-white border-l-4 border-red-600';
    
    return `${baseClasses} ${typeClasses}`;
  }

  // Animate message entry with slide effect
  private static animateMessageEntry(messageDiv: HTMLElement): void {
    requestAnimationFrame(() => {
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateX(0)';
    });
  }

  // Schedule automatic message removal
  private static scheduleRemoval(messageDiv: HTMLElement, container: HTMLElement): void {
    setTimeout(() => {
      this.removeMessage(messageDiv, container);
    }, this.DISPLAY_TIME);
  }

  // Remove message with fade out animation
  private static removeMessage(messageDiv: HTMLElement, container?: HTMLElement): void {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      this.finalizeMessageRemoval(messageDiv, container);
    }, this.FADE_OUT_DELAY);
  }

  // Finalize message removal and cleanup container
  private static finalizeMessageRemoval(messageDiv: HTMLElement, container?: HTMLElement): void {
    messageDiv.remove();
    
    const messageContainer = container || document.getElementById(this.CONTAINER_ID);
    if (messageContainer && messageContainer.childElementCount === 0) {
      messageContainer.remove();
    }
  }
}