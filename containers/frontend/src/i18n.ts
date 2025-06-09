import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const i18n = i18next.createInstance();

i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: 'en',
    supportedLngs: ['cat', 'en', 'es', 'fr'],
    ns: ['landing', 'signin', 'signup', 'profile'],
    defaultNS: 'landing',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    }
  });

export default i18n;