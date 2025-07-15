import i18n from '../i18n';
import { navigate } from '../utils/router';
import { MessageManager } from '../utils/messageManager';

let currentResizeHandler: (() => void) | null = null;

export async function showStats(container: HTMLElement, username?: string): Promise<void> {
  try {
    await initializeI18n();
    await render(container, username);
  } catch (error) {
    console.error('Failed to initialize stats:', error);
    MessageManager.showError('Error loading stats');
    navigate('/profile ');
    return;
  }
}

async function initializeI18n(): Promise<void> {
  await i18n.loadNamespaces('stats');
  await i18n.changeLanguage(i18n.language);
}

function render(container: HTMLElement, username?: string): void {
  cleanup();
  const renderer = new StatsRenderer(
    container, 
    () => showStats(container, username),
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