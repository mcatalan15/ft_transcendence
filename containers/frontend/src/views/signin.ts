import { loadGoogleScript, setupGoogleSignUp } from "../utils/auth/googleSignUp";

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
			setupGoogleSignUp()

			const wrapper = document.createElement('div');
			wrapper.innerHTML = `
        <div class="h-screen flex items-center justify-center bg-neutral-900">
          <div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6 relative">
            <h2 class="text-2xl font-semibold text-center">${i18n.t('title', { ns: 'signin' })}</h2>
            <form id="login-form" class="space-y-4">
              <input type="email" id="email" placeholder="${i18n.t('email', { ns: 'signin' })}" class="w-full border px-3 py-2 rounded" required />
              <input type="password" id="password" placeholder="${i18n.t('password', { ns: 'signin' })}" class="w-full border px-3 py-2 rounded" required />
              <div id="errorMessage" class="text-red-500 text-sm"></div>
              <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                ${i18n.t('signIn', { ns: 'signin' })}
              </button>
            </form>
            <div class="flex flex-col mt-4 text-sm text-center dark:text-gray-300">
              <p>
                Don't have an account?
                <a href="/signup" class="text-blue-400 transition hover:underline">
                  ${i18n.t('signUp', { ns: 'signin' })}
                </a>
              </p>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <hr class="flex-1 border-gray-300" />
            </div>
            <div>
              <div id="g_id_onload"
                data-client_id="49814417427-6kej25nd57avgbpp6k7fgphe9pmtshvf.apps.googleusercontent.com"
					      data-context="signin"
					      data-login_uri="http://localhost:5173"
					      data-auto_select="true"
					      data-callback="handleGoogleSignUp"
					      data-itp_support="true"
					      data-auto_prompt="false">
              </div>
              <div class="g_id_signin"
                data-type="standard"
                data-size="large"
                data-theme="outline"
                data-text="sign_in_with"
                data-shape="rectangular"
                data-logo_alignment="left">
              </div>
            </div>
          </div>
        </div>
      `;

			container.appendChild(wrapper);

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
					if (result.token) {
						localStorage.setItem('token', result.token);
					}
					navigate('/profile');
				}
			};

			// SPA link to signup
			const signUpLink = wrapper.querySelector('a[href="/signup"]');
			signUpLink?.addEventListener('click', (e) => {
				e.preventDefault();
				navigate('/signup');
			});


			const langSelector = new LanguageSelector(() => {
				const emailInput = wrapper.querySelector('#email') as HTMLInputElement;
				const passwordInput = wrapper.querySelector('#password') as HTMLInputElement;
				const btn = wrapper.querySelector('button[type="submit"]') as HTMLButtonElement;
				const title = wrapper.querySelector('h2')!;
				const link = wrapper.querySelector('a');

				emailInput.placeholder = i18n.t('email', { ns: 'signin' });
				passwordInput.placeholder = i18n.t('password', { ns: 'signin' });
				btn.textContent = i18n.t('signIn', { ns: 'signin' });
				title.textContent = i18n.t('title', { ns: 'signin' });
				link!.textContent = i18n.t('signUp', { ns: 'signin' });
			});

			const selectorWrapper = document.createElement('div');
			selectorWrapper.className = 'absolute bottom-4 w-full flex justify-center z-30';
			selectorWrapper.appendChild(langSelector.getElement());
			document.body.appendChild(selectorWrapper);
		});
}
