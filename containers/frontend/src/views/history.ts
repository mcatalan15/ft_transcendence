import i18n from '../i18n';
import { navigate } from '../utils/router';
import { HistoryRenderer } from '../components/history/historyRenderer';

let currentResizeHandler: (() => void) | null = null;

export async function showHistory(container: HTMLElement): Promise<void> {
  try {
    await initializeI18n();
    render(container);
  } catch (error) {
    console.error('Failed to initialize history:', error);
    navigate('/home');
  }
}

async function initializeI18n(): Promise<void> {
  await i18n.loadNamespaces('history');
  await i18n.changeLanguage(i18n.language);
}

function render(container: HTMLElement): void {
  cleanup();
  const renderer = new HistoryRenderer(container, () => showHistory(container));
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