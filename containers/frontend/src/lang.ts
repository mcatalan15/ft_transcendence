let currentLang: string = localStorage.getItem('lang') || 'en';
let translations: Record<string, string> = {};

export async function loadLanguage(lang: string): Promise<void> {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  translations = await fetch(`/locales/${lang}.json`).then(res => res.json());
}

export function t(key: string): string {
  return translations[key] || key;
}

export function getCurrentLang(): string {
  return currentLang;
}

export function changeLanguage(langSwitcher: HTMLSelectElement): void {
  langSwitcher.value = localStorage.getItem('lang') || 'fr';
  langSwitcher.addEventListener('change', async (e) => {
    const target = e.target as HTMLSelectElement | null;
    if (target) {
      await import('./lang').then(async ({ loadLanguage }) => {
        await loadLanguage(target.value);
        location.reload();
      });
    }
  });
}