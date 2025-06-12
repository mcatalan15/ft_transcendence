import { localSignUp } from "../utils/auth/localSignUp";
import { loadGoogleScript, setupGoogleSignUp } from "../utils/auth/googleSignUp";
import i18n from '../i18n';
import { LanguageSelector } from '../components/languageSelector';

export function showSignUp(container: HTMLElement): void {
	loadGoogleScript();
	setupGoogleSignUp()

	const SignUpDiv = document.createElement('div');
	SignUpDiv.innerHTML = `
    <div class="fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden" id="landing-wrapper">

	  	<div class="relative h-full flex flex-col">

        	<div class="pt-6 w-full flex justify-center gap-x-4 z-30">

				<div class="h-screen flex items-center justify-center text-amber-50 bg-gradient-to-br from-neutral-900">

					<div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6">
						<h2 class="text-2xl font-semibold text-center">Let's start!</h2>

						<form id="login-form" class="space-y-4">
							<input type="nickname" id="nickname" placeholder="${i18n.t('Nickname')}" required class="w-full border px-3 py-2 rounded" />
							<input type="email" id="email" placeholder="${i18n.t('E-mail')}" required class="w-full border px-3 py-2 rounded" />
							<input type="password" id="password" placeholder="${i18n.t('Password')}" required class="w-full border px-3 py-2 rounded" />
							<input type="password" id="confirmPassword" placeholder="${i18n.t('Confirm Password')}" required class="w-full border px-3 py-2 rounded" />
							<button type="submit" id="sign-up-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
								${i18n.t('Sign up')}
							</button>
						</form>

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
				//! Change for prod!
				// navigate('/signin');
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
}
