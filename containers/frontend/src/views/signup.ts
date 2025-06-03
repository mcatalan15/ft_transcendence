import { localSignUp } from "../auth/localSignUp";
import { loadGoogleScript, setupGoogleSignUp } from "../auth/googleSignUp";
import i18n from '../i18n';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router'; // ✅ Importar navegación SPA

export function showSignUp(container: HTMLElement): void {
  i18n
    .loadNamespaces('signup')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      loadGoogleScript();
      setupGoogleSignUp();

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
                data-client_id="YOUR_GOOGLE_CLIENT_ID"
                data-login_uri="https://your.domain/your_login_endpoint"
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
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
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
          navigate('/signin'); // ✅ SPA redirection
        }
      };

      // SPA: interceptar enlace Sign In
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

				</div>
					</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
	`;

	
	const form = SignUpDiv.querySelector('#login-form') as HTMLFormElement;
	const errorMessageDiv = document.createElement('div');
	errorMessageDiv.style.color = 'red';
	errorMessageDiv.style.marginTop = '10px';
	SignUpDiv.appendChild(errorMessageDiv);
	
	
	console.log('[signup.ts] Form element selected:', form);
	form.onsubmit = async (e) => {
		e.preventDefault();
		console.log('[signup.ts] Form submission detected!');
		const username = (SignUpDiv.querySelector('#nickname') as HTMLInputElement).value;
		const email = (SignUpDiv.querySelector('#email') as HTMLInputElement).value;
		const password = (SignUpDiv.querySelector('#password') as HTMLInputElement).value;
		const confirmPassword = (SignUpDiv.querySelector('#confirmPassword') as HTMLInputElement).value;
		errorMessageDiv.textContent = '';
		if (!username || !email || !password || !confirmPassword) {
			errorMessageDiv.textContent = 'All fields are required!';
			return;
		}
		if (username.length < 3 || username.length > 8) {
			errorMessageDiv.textContent = 'Username must be between 3 and 8 characters long!';
			return;
		}
		
		if (password.length < 6 || password.length > 20) {
			errorMessageDiv.textContent = 'Password must be between 6 and 20 characters long!';
			return;
		}
		
		if (!/^(?=[a-zA-Z0-9-]{3,8}$)(?!-)(?!.*-.*-)[a-zA-Z0-9-]+$/.test(username)) {
			errorMessageDiv.textContent = 'Username can only contain letters, numbers and a single hyphen!';
			return;
		}		
		
		if (password === confirmPassword) {
			const result = await localSignUp(username, email, password);
			console.log('[CALLING CODE] localSignUp result:', result);
			console.log('[CALLING CODE] result.userId:', result.userId);
			console.log('[CALLING CODE] result.username:', result.username);
			console.log('[CALLING CODE] result.email:', result.email);
			sessionStorage.setItem('userId', String(result.userId));
			sessionStorage.setItem('username', String(result.username));
			sessionStorage.setItem('email', String(result.email));
			if (!result.success) {
				errorMessageDiv.textContent = result.message;
			} else {
				alert('Registration successful!');
				window.location.href = '/auth?from=signup';
				// navigate('/auth');
			}
		} else {
			errorMessageDiv.textContent = 'Passwords do not match!';
		}
	};
	container.appendChild(SignUpDiv);
	
	const wrapper = SignUpDiv.querySelector('.flex-col')!;
	const langSelector = new LanguageSelector(() => {
		const nicknameInput = SignUpDiv.querySelector('#nickname') as HTMLButtonElement;
		const emailInput = SignUpDiv.querySelector('#email') as HTMLButtonElement;
		const passwordInput = SignUpDiv.querySelector('#password') as HTMLButtonElement;
		const confirmPasswordInput = SignUpDiv.querySelector('#confirmPassword') as HTMLButtonElement;
		const signUpBtn = SignUpDiv.querySelector('#sign-up-btn') as HTMLButtonElement;
		nicknameInput.placeholder = i18n.t('signup:Nickname');
		emailInput.placeholder = i18n.t('signup:E-mail');
		passwordInput.placeholder = i18n.t('signup:Password');
		confirmPasswordInput.placeholder = i18n.t('signup:ConfirmPassword');
		signUpBtn.textContent = i18n.t('Sign up');
	});
	wrapper.appendChild(langSelector.getElement());

      const selectorWrapper = document.createElement('div');
      selectorWrapper.className = 'absolute bottom-4 w-full flex justify-center z-30';
      selectorWrapper.appendChild(langSelector.getElement());
      document.body.appendChild(selectorWrapper);
    });

}
