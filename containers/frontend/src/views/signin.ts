import { loadGoogleScript, setupGoogleSignUp, initializeGoogleButton } from "../utils/auth/googleSignUp";

import i18n from '../i18n';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { localSignIn } from '../utils/auth/localSignIn';
import { navigate } from '../utils/router';

export function showSignIn(container: HTMLElement): void {
  i18n
    .loadNamespaces('signin')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      loadGoogleScript();
      setupGoogleSignUp();

      container.innerHTML = '';

      const langSelector = new LanguageSelector(() => showSignIn(container)).getElement();
      container.appendChild(langSelector);

      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center justify-center min-h-screen bg-neutral-900';
      wrapper.innerHTML = `
        <div class="w-full max-w-md flex flex-col items-center">
          <div class="bg-neutral-900 border-2 border-amber-50 text-amber-50 w-full px-8 py-10 flex flex-col items-center" style="border-radius:0px;">
            <h2 class="text-2xl font-bold mb-8 text-center" style="font-family:'Roboto Mono', monospace; text-transform:uppercase;">${i18n.t('title', { ns: 'signin' })}</h2>
            <form id="login-form" class="w-full flex flex-col gap-4">
              <input type="email" id="email" placeholder="${i18n.t('email', { ns: 'signin' })}"
                class="w-full px-4 py-3 border-2 border-amber-50 bg-transparent text-amber-50 focus:outline-none"
                style="font-family:'Roboto Mono', monospace; border-radius:0px; font-size:14px;" required />
              <input type="password" id="password" placeholder="${i18n.t('password', { ns: 'signin' })}"
                class="w-full px-4 py-3 border-2 border-amber-50 bg-transparent text-amber-50 focus:outline-none"
                style="font-family:'Roboto Mono', monospace; border-radius:0px; font-size:14px;" required />
              <div id="errorMessage" class="text-red-500 text-sm"></div>
              <button type="submit"
                class="w-full py-3 mt-2 transition-all duration-300"
                style="background:transparent; border:2px solid #FFFBEB; color:#FFFBEB; font-family:'Roboto Mono', monospace; font-weight:bold; font-size:14px; text-transform:uppercase; border-radius:0px; cursor:pointer;">
                ${i18n.t('signIn', { ns: 'signin' })}
              </button>
            </form>
            <div class="flex flex-col mt-6 text-sm text-center">
              <p style="font-family:'Roboto Mono', monospace;">
                ${i18n.t('noAccount', { ns: 'signin', defaultValue: "Don't have an account?" })}
                <a href="/signup" class="text-amber-400 hover:underline" style="font-family:'Roboto Mono', monospace;">
                  ${i18n.t('signUp', { ns: 'signin' })}
                </a>
              </p>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500 w-full my-6">
              <hr class="flex-1 border-amber-50 opacity-30" />
            </div>
            <div>
				<div id="google-signin-button"></div>
            </div>
          </div>
        </div>
      `;

      container.appendChild(wrapper);

      const btn = wrapper.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (btn) {
        btn.addEventListener('mouseenter', () => {
          btn.style.backgroundColor = '#FFFBEB';
          btn.style.color = '#171717';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.backgroundColor = 'transparent';
          btn.style.color = '#FFFBEB';
        });
      }

			(async (): Promise<void> => {
				try {
					await loadGoogleScript();
					setupGoogleSignUp();
					initializeGoogleButton('google-signin-button');
				} catch (error) {
					console.error('Failed to initialize Google Sign-In:', error);
				}
			})();

      const form = wrapper.querySelector('#login-form') as HTMLFormElement;
      const errorMessageDiv = wrapper.querySelector('#errorMessage') as HTMLDivElement;

      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = (wrapper.querySelector('#email') as HTMLInputElement).value;
        const password = (wrapper.querySelector('#password') as HTMLInputElement).value;
        errorMessageDiv.textContent = '';

        if (!email || !password) {
          errorMessageDiv.textContent = i18n.t('errorAllFields', { ns: 'signin' });
          return;
        }

        const result = await localSignIn(email, password);
        if (!result.success) {
          errorMessageDiv.textContent = result.message || i18n.t('errorInvalidCredentials', { ns: 'signin' });
        } else {
          alert(i18n.t('success', { ns: 'signin' }));
          navigate('/profile');
        }
      };

      const signUpLink = wrapper.querySelector('a[href="/signup"]');
      signUpLink?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/signup');
      });
    });
}