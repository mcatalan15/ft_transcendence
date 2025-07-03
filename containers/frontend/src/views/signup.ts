import { localSignUp } from "../utils/auth/localSignUp";
import { loadGoogleScript, setupGoogleSignUp } from "../utils/auth/googleSignUp";
import i18n from '../i18n';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { navigate } from '../utils/router';

export function showSignUp(container: HTMLElement): void {
  i18n
    .loadNamespaces('signup')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      loadGoogleScript();
      setupGoogleSignUp();;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div class="h-screen flex items-center justify-center bg-neutral-900">
          <div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6 relative">
            <h2 class="text-2xl font-semibold text-center">${i18n.t('title', { ns: 'signup' })}</h2>
            <form id="signup-form" class="space-y-4">
              <input type="text" id="nickname" placeholder="${i18n.t('nickname', { ns: 'signup' })}" class="w-full border px-3 py-2 rounded" required />
              <input type="email" id="email" placeholder="${i18n.t('email', { ns: 'signup' })}" class="w-full border px-3 py-2 rounded" required />
              <input type="password" id="password" placeholder="${i18n.t('password', { ns: 'signup' })}" class="w-full border px-3 py-2 rounded" required />
              <input type="password" id="confirmPassword" placeholder="${i18n.t('confirmPassword', { ns: 'signup' })}" class="w-full border px-3 py-2 rounded" required />
              <button type="submit" id="sign-up-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                ${i18n.t('signUp', { ns: 'signup' })}
              </button>
            </form>
            <div class="flex flex-col mt-4 text-sm text-center dark:text-gray-300">
              <p>
                Already have an account?
                <a href="/signin" class="text-blue-400 transition hover:underline">
                  Sign In
                </a>
              </p>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <hr class="flex-1 border-gray-300" />
            </div>
            <div>
              <div id="g_id_onload"
                data-client_id="49814417427-6kej25nd57avgbpp6k7fgphe9pmtshvf.apps.googleusercontent.com"
                data-login_uri="http://localhost:5173"
              data-callback="handleGoogleSignUp"
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
            <div id="errorMessage" class="text-red-500 text-sm"></div>
          </div>
        </div>
      `;

      container.appendChild(wrapper);

      const form = wrapper.querySelector('#signup-form') as HTMLFormElement;
      const errorMessageDiv = wrapper.querySelector('#errorMessage') as HTMLDivElement;

      form.onsubmit = async (e) => {
        e.preventDefault();
        const username = (wrapper.querySelector('#nickname') as HTMLInputElement).value;
        const email = (wrapper.querySelector('#email') as HTMLInputElement).value;
        const password = (wrapper.querySelector('#password') as HTMLInputElement).value;
        const confirmPassword = (wrapper.querySelector('#confirmPassword') as HTMLInputElement).value;
        errorMessageDiv.textContent = '';

        if (!username || !email || !password || !confirmPassword) {
          errorMessageDiv.textContent = i18n.t('errorAllFields', { ns: 'signup' });
          return;
        }
        if (username.length < 3 || username.length > 8) {
          errorMessageDiv.textContent = i18n.t('errorUsernameLength', { ns: 'signup' });
          return;
        }
        if (!/^(?=[a-zA-Z0-9-]{3,8}$)(?!-)(?!.*-.*-)[a-zA-Z0-9-]+$/.test(username)) {
          errorMessageDiv.textContent = i18n.t('errorUsernameChars', { ns: 'signup' });
          return;
        }
        if (password.length < 6 || password.length > 20) {
          errorMessageDiv.textContent = i18n.t('errorPasswordLength', { ns: 'signup' });
          return;
        }
        if (password !== confirmPassword) {
          errorMessageDiv.textContent = i18n.t('errorPasswordsMatch', { ns: 'signup' });
          return;
        }

        const result = await localSignUp(username, email, password);
        if (!result.success) {
          errorMessageDiv.textContent = result.message;
        } else {
          alert('Registration successful!');
          navigate('/signin');
        }
      };

      const signInLink = wrapper.querySelector('a[href="/signin"]');
      signInLink?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/signin');
      });

      const langSelector = new LanguageSelector(() => {
        const nickname = wrapper.querySelector('#nickname') as HTMLInputElement;
        const email = wrapper.querySelector('#email') as HTMLInputElement;
        const password = wrapper.querySelector('#password') as HTMLInputElement;
        const confirmPassword = wrapper.querySelector('#confirmPassword') as HTMLInputElement;
        const btn = wrapper.querySelector('#sign-up-btn') as HTMLButtonElement;
        const title = wrapper.querySelector('h2')!;

        nickname.placeholder = i18n.t('nickname', { ns: 'signup' });
        email.placeholder = i18n.t('email', { ns: 'signup' });
        password.placeholder = i18n.t('password', { ns: 'signup' });
        confirmPassword.placeholder = i18n.t('confirmPassword', { ns: 'signup' });
        btn.textContent = i18n.t('signUp', { ns: 'signup' });
        title.textContent = i18n.t('title', { ns: 'signup' });
      });

	wrapper.appendChild(langSelector.getElement());

      const selectorWrapper = document.createElement('div');
      selectorWrapper.className = 'absolute bottom-4 w-full flex justify-center z-30';
      selectorWrapper.appendChild(langSelector.getElement());
      document.body.appendChild(selectorWrapper);
    });

}
