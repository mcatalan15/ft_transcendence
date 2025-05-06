import i18n from '../i18n';
import i18next from 'i18next';

import { LanguageSelector } from '../components/languageSelector';
import { localSignIn } from '../auth/localSignIn';

function loadGoogleScript(): void {
	if (document.getElementById('google-script')) return;

	const script = document.createElement('script');
	script.src = 'https://accounts.google.com/gsi/client';
	script.id = 'google-script';
	script.async = true;
	script.defer = true;
	document.head.appendChild(script);
}

export function showSignIn(container: HTMLElement): void {
	loadGoogleScript();

	const SignInDiv = document.createElement('div');
	SignInDiv.innerHTML = `
	<div class="fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden" id="landing-wrapper">
		<div class="relative h-full flex flex-col">
		<div class="h-screen flex items-center justify-center text-amber-50 bg-gradient-to-br from-neutral-900">
			<div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6">
				<h2 class="text-2xl font-semibold text-center">Let's play!</h2>

				<form id="login-form" class="space-y-4">
					<input type="email" id="email" placeholder="${i18n.t('email')}" required class="w-full border px-3 py-2 rounded" />
					<input type="password" id="password" placeholder="${i18n.t('password')}" required class="w-full border px-3 py-2 rounded" />
					<div id="errorMessage" style="color: red; margin-top: 10px;"></div>
					<button type="submit" id="sign-in-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
					${i18n.t('signIp')}
					</button>
				</form>

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
		</div>
		</div>
	</div>

	`;

	const form = SignInDiv.querySelector('#login-form') as HTMLFormElement;
	const errorMessageDiv = SignInDiv.querySelector('#errorMessage') as HTMLInputElement;

	errorMessageDiv.textContent = '';

	form.onsubmit = async (e) => {
		e.preventDefault();
		const email = (SignInDiv.querySelector('#email') as HTMLInputElement).value;
		const password = (SignInDiv.querySelector('#password') as HTMLInputElement).value;

		if (email && password) {
			const result = await localSignIn(email, password);
			if (!result.success) {
				// Display the error message from the backend
				errorMessageDiv.textContent = result.message;
			} else {
				// Sign-in successful - show success message and redirect
				alert('Sign-in successful!');
				localStorage.setItem('token', result.token);
				navigate('/home');
			}
		} else {
			errorMessageDiv.textContent = 'Invalid email or password';
		}
	};

	container.appendChild(SignInDiv);

	const wrapper = SignInDiv.querySelector('.flex-col')!;
	const langSelector = new LanguageSelector(() => {
		const emailInput = SignInDiv.querySelector('#email') as HTMLButtonElement;
		const passwordInput = SignInDiv.querySelector('#password') as HTMLButtonElement;
		const signUpBtn = SignInDiv.querySelector('#sign-in-btn') as HTMLButtonElement;
		emailInput.placeholder = i18n.t('email');
		passwordInput.placeholder = i18n.t('password');
		signUpBtn.textContent = i18n.t('signIn');
	});
	wrapper.appendChild(langSelector.getElement());
}
