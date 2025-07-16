import { CONFIG } from '../../config/settings.config';
import { MessageManager } from '../../utils/messageManager';
import { changeNickname, changePassword } from '../../utils/profile/profileUtils';
import i18n from '../../i18n';

export class SettingsFormsRenderer {
  private container: HTMLElement;
  private username: string;
  private userId: string;
  private classicMode: boolean;

  constructor(container: HTMLElement, username: string, userId: string) {
    this.container = container;
    this.username = username;
    this.userId = userId;
    this.classicMode = false;
  }

  render(): HTMLElement {
    const mainContent = document.createElement('div');
    mainContent.className = 'flex flex-col items-center w-full';
    mainContent.style.backgroundColor = '#171717';

    const formsSection = this.createPongStyleFormsSection();
    mainContent.appendChild(formsSection);

    return mainContent;
  }

  private createPongStyleFormsSection(): HTMLElement {
    const formsContainer = document.createElement('div');
    formsContainer.className = 'w-full flex flex-col items-center mt-8 px-4';

    const overlay = this.createPongOverlay();
    
    const nicknameForm = this.createPongStyleNicknameForm();
    overlay.appendChild(nicknameForm);

    if (sessionStorage.getItem('localAuth') === 'true') {
      const passwordForm = this.createPongStylePasswordForm();
      overlay.appendChild(passwordForm);
    }

    formsContainer.appendChild(overlay);
    return formsContainer;
  }

  private createPongOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'relative p-6 gap-6 flex flex-col items-center';
    
    overlay.style.backgroundColor = '#171717';
    overlay.style.borderRadius = '0px';
    overlay.style.width = '100%';
    overlay.style.maxWidth = '1000px';

    return overlay;
  }

  private createPongStyleNicknameForm(): HTMLElement {
    const formContainer = document.createElement('div');
    formContainer.className = 'w-full flex flex-col items-center gap-4';

    const headerBar = this.createPongHeaderBar(i18n.t('settings:changeNickname'));
    formContainer.appendChild(headerBar);

    const currentNicknameContainer = this.createPongTextLine(
      i18n.t('settings:current') + ':', 
      this.username
    );
    formContainer.appendChild(currentNicknameContainer);

    const newNicknameInput = this.createPongStyleInput(
      'new-nickname', 
      i18n.t('settings:newNickname')
    );
    formContainer.appendChild(newNicknameInput);

    const submitButton = this.createPongStyleButton(
      i18n.t('settings:updateNickname'), 
      () => this.handleNicknameSubmit(newNicknameInput)
    );
    formContainer.appendChild(submitButton);

    return formContainer;
  }

  private createPongStylePasswordForm(): HTMLElement {
    const formContainer = document.createElement('div');
    formContainer.className = 'w-full flex flex-col items-center gap-4 mt-8';

    const headerBar = this.createPongHeaderBar(i18n.t('settings:changePassword'));
    formContainer.appendChild(headerBar);

    const currentPasswordInput = this.createPongStyleInput(
      'current-password', 
      i18n.t('settings:currentPassword'), 
      'password'
    );
    const newPasswordInput = this.createPongStyleInput(
      'new-password', 
      i18n.t('settings:newPassword'), 
      'password'
    );
    const confirmPasswordInput = this.createPongStyleInput(
      'confirm-password', 
      i18n.t('settings:confirmPassword'), 
      'password'
    );

    formContainer.appendChild(currentPasswordInput);
    formContainer.appendChild(newPasswordInput);
    formContainer.appendChild(confirmPasswordInput);

    const submitButton = this.createPongStyleButton(
      i18n.t('settings:updatePassword'), 
      () => this.handlePasswordSubmit(currentPasswordInput, newPasswordInput, confirmPasswordInput)
    );
    formContainer.appendChild(submitButton);

    return formContainer;
  }

  private createPongHeaderBar(text: string): HTMLElement {
    const headerContainer = document.createElement('div');
    headerContainer.className = 'w-full relative mb-4';
    
    const headerBar = document.createElement('div');
    headerBar.style.width = '100%';
    headerBar.style.height = '25px';
    headerBar.style.backgroundColor = this.getPongColor();
    headerBar.style.border = `2px solid ${this.getPongColor()}`;
    headerBar.style.position = 'relative';

    const headerText = document.createElement('span');
    headerText.textContent = text.toUpperCase();
    headerText.style.color = '#171717';
    headerText.style.fontFamily = '"Roboto Mono", monospace';
    headerText.style.fontWeight = 'bold';
    headerText.style.fontSize = '12px';
    headerText.style.position = 'absolute';
    headerText.style.left = '10px';
    headerText.style.top = '50%';
    headerText.style.transform = 'translateY(-50%)';

    headerBar.appendChild(headerText);
    headerContainer.appendChild(headerBar);

    return headerContainer;
  }

  private createPongTextLine(label: string, value: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'w-full flex justify-between items-center py-2';
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    labelSpan.style.color = this.getPongColor();
    labelSpan.style.fontFamily = '"Roboto Mono", monospace';
    labelSpan.style.fontWeight = 'bold';
    labelSpan.style.fontSize = '14px';

    const valueSpan = document.createElement('span');
    valueSpan.textContent = value;
    valueSpan.style.color = this.getPongColor();
    valueSpan.style.fontFamily = '"Roboto Mono", monospace';
    valueSpan.style.fontWeight = 'normal';
    valueSpan.style.fontSize = '14px';
    valueSpan.style.opacity = '0.8';

    container.appendChild(labelSpan);
    container.appendChild(valueSpan);

    return container;
  }

  private createPongStyleInput(id: string, placeholder: string, type: string = 'text'): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.placeholder = `> ${placeholder.toUpperCase()}`;
    input.className = 'w-full py-3 px-4 transition-all duration-300';
    
    input.style.backgroundColor = 'transparent';
    input.style.border = `2px solid ${this.getPongColor()}`;
    input.style.color = this.getPongColor();
    input.style.fontFamily = '"Roboto Mono", monospace';
    input.style.fontWeight = 'bold';
    input.style.fontSize = '14px';
    input.style.outline = 'none';

    input.addEventListener('focus', () => {
      input.style.boxShadow = `0 0 10px ${this.getPongColor()}66`;
      input.style.borderColor = this.getPongColor();
    });

    input.addEventListener('blur', () => {
      input.style.boxShadow = 'none';
    });

    return input;
  }

  private createPongStyleButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text.toUpperCase();
    button.className = 'py-3 px-8 transition-all duration-300 cursor-pointer';
    
    button.style.backgroundColor = 'transparent';
    button.style.border = `3px solid ${this.getPongColor()}`;
    button.style.color = this.getPongColor();
    button.style.fontFamily = '"Roboto Mono", monospace';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '14px';

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = this.getPongColor();
      button.style.color = '#171717';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
      button.style.color = this.getPongColor();
    });

    button.onclick = onClick;
    return button;
  }

  private getPongColor(): string {
    return this.classicMode ? '#FFFFFF' : '#FFFBEB';
  }

  private async handleNicknameSubmit(newField: HTMLInputElement): Promise<void> {
    const newNickname = newField.value.trim();
    
    if (!newNickname) {
      MessageManager.showError(i18n.t('settings:errors.nicknameRequired'));
      return;
    }
    if (newNickname.length < 3 || newNickname.length > 8) {
      MessageManager.showError(i18n.t('settings:errors.nicknameLength'));
      return;
    }
    if (!/^(?=[a-z0-9-]{3,8}$)(?!-)(?!.*-.*-)[a-z0-9-]+$/.test(newNickname)) {
      MessageManager.showError(i18n.t('settings:errors.nicknameFormat'));
      return;
    }
    
    await changeNickname(newNickname);
  }

  private async handlePasswordSubmit(
    currentField: HTMLInputElement, 
    newField: HTMLInputElement, 
    confirmField: HTMLInputElement
  ): Promise<void> {
    const currentPassword = currentField.value;
    const newPassword = newField.value;
    const confirmPassword = confirmField.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      MessageManager.showError(i18n.t('settings:errors.passwordRequired'));
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      MessageManager.showError(i18n.t('settings:errors.passwordLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      MessageManager.showError(i18n.t('settings:errors.passwordMismatch'));
      return;
    }
    if (currentPassword === newPassword) {
      MessageManager.showError(i18n.t('settings:errors.passwordSame'));
      return;
    }

    await changePassword(currentPassword, newPassword);
  }
}