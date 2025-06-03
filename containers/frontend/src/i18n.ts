import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

//const i18n = i18next.createInstance();

/*i18n.init({
    fallbackLng: 'en',
    lng: localStorage.getItem('lng') || 'en',


    resources: {
        en: {
            translation: {
                signIn: 'Sign in',
                signUp: 'Sign up',
                languageEn: 'EN',
                languageEs: 'ES',
                languageFr: 'FR',
                nickname: 'Nickname',
                email:'E-mail',
                password: 'Password',
                confirmPassword: 'Confirm Password'

            }
        },
        fr: {
            translation: {
                signIn: 'Se connecter',
                signUp: 'S\'inscrire',
                languageEn: 'EN',
                languageEs: 'ES',
                languageFr: 'FR',
                nickname: 'Pseudo',
                email: 'Courriel',
                password: 'Mot de passe',
                confirmPassword: 'Confirmez le mot de passe'
            }
        },
        es: {
            translation: {
                signIn: 'Iniciar sesión',
                signUp: 'Registrarse',
                languageEn: 'EN',
                languageEs: 'ES',
                languageFr: 'FR',
                nickname: 'Alias',
                email: 'Correo electrónico',
                password: 'Contraseña',
                confirmPassword: 'Confirme la contraseña'
            }
        }
    }
});

export default i18n;*/


// Crear una instancia de i18next explícitamente
const i18n = i18next.createInstance();

i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: 'en',
    supportedLngs: ['cat', 'en', 'es', 'fr'],
    ns: ['landing', 'signin', 'signup'],
    defaultNS: 'landing',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

