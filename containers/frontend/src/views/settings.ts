import i18n from '../i18n';
import { navigate } from '../utils/router';
import { SettingsRenderer } from '../components/settings/settingsRenderer';
import { ProfileLoader } from '../utils/profileLoader';
import { MessageManager } from '../utils/messageManager';

let currentResizeHandler: (() => void) | null = null;

export async function showSettings(container: HTMLElement): Promise<void> {
  try {
    await initializeI18n();
    render(container);
  } catch (error) {
    console.error('Failed to initialize settings:', error);
    navigate('/home');
  }
}

async function initializeI18n(): Promise<void> {
  await i18n.loadNamespaces('settings');
  await i18n.changeLanguage(i18n.language);
}

function render(container: HTMLElement): void {
  cleanup();

  const updateProfile = () => {
    const pongBoxElement = renderer.getPongBoxElement();
    if (pongBoxElement) {
      ProfileLoader.loadUserProfile(pongBoxElement);
    }
  };

  const renderer = new SettingsRenderer(
    container, 
    () => showSettings(container),
    updateProfile  // Pasamos la función de actualización
  );
  renderer.render();
  
  const pongBoxElement = renderer.getPongBoxElement();
  if (pongBoxElement) {
    ProfileLoader.loadUserProfile(pongBoxElement);
  }
  
  MessageManager.createContainer(container);
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