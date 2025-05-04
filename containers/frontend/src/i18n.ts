import i18next from 'i18next';

const i18n = i18next.createInstance();

i18n.init({
    fallbackLng: 'en',
    lng: localStorage.getItem('lng') || 'en',


    resources: {
        en: {
            translation: {
                signIn: 'Sign in',
                signUp: 'Sign up',
                languageEn: 'EN',
                languageEs: 'ES',
                languageFr: 'FR'
            }
        },
        fr: {
            translation: {
                signIn: 'Se connecter',
                signUp: 'S\'inscrire',
                languageEn: 'EN',
                languageEs: 'ES',
                languageFr: 'FR'
            }
        },
        es: {
            translation: {
                signIn: 'Iniciar sesión',
                signUp: 'Registrarse',
                languageEn: 'EN',
                languageEs: 'ES',
                languageFr: 'FR'
            }
        }
    }
});

export default i18n;
