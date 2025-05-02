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
