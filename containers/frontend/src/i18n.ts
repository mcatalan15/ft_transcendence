import i18next from 'i18next';

const i18n = i18next.createInstance();
// Initialisation de i18next
i18n.init({
    lng: 'en', // langue par défaut
    fallbackLng: 'en',
    //debug: true,
    resources: {
        en: {
            translation: {
                sign_in: 'Sign in',
                sign_up: 'Sign up',
                language_en: 'English',
                language_es: 'Español',
                language_fr: 'Français'
            }
        },
        fr: {
            translation: {
                sign_in: 'Se connecter',
                sign_up: 'S\'inscrire',
                language_en: 'Anglais',
                language_es: 'Espagnol',
                language_fr: 'Français'
            }
        },
        es: {
            translation: {
                sign_in: 'Iniciar sesión',
                sign_up: 'Registrarse',
                language_en: 'Inglés',
                language_es: 'Castellano',
                language_fr: 'Francés'
            }
        }
    }
});

export default i18next;
