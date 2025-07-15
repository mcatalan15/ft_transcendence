import i18n from '../i18n';
import { navigate } from '../utils/router';
import { ProfileRenderer } from '../components/profile/profileRenderer';
import { MessageManager } from '../utils/messageManager';

let currentResizeHandler: (() => void) | null = null;

export async function showProfile(container: HTMLElement, username?: string): Promise<void> {
  try {
    await initializeI18n();
    await render(container, username);
  } catch (error) {
    console.error('Failed to initialize profile:', error);
    MessageManager.showError('Error loading profile');
    navigate('/home');
    return;
  }
}

async function initializeI18n(): Promise<void> {
  await i18n.loadNamespaces('profile');
  await i18n.changeLanguage(i18n.language);
}

function render(container: HTMLElement, username?: string): void {
  cleanup();
  const renderer = new ProfileRenderer(
    container, 
    () => showProfile(container, username),
    username
  );
  renderer.render();
}

function cleanup(): void {
  if (currentResizeHandler) {
    window.removeEventListener('resize', currentResizeHandler);
    currentResizeHandler = null;
  }
}

export function setResizeHandler(handler: (() => void) | null): void {
  currentResizeHandler = handler;
}