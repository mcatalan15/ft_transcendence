import { loadGoogleScript, setupGoogleSignUp } from "../utils/auth/googleSignUp";

import i18n from '../i18n';
import i18next from 'i18next';

import { LanguageSelector } from '../components/languageSelector';
import { localSignIn } from '../utils/auth/localSignIn';

export function showSignIn(container: HTMLElement): void {
	loadGoogleScript();
	setupGoogleSignUp();

	const SignInDiv = document.createElement('div');
	SignInDiv.innerHTML = `
	<div class="fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden" id="landing-wrapper">
		<div class="relative h-full flex flex-col">
		<div class="h-screen flex items-center justify-center text-amber-50 bg-gradient-to-br from-neutral-900">
			<div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6">
				<h2 class="text-2xl font-semibold text-center">Let's play!</h2>

				<form id="login-form" class="space-y-4">
					<input type="email" id="email" placeholder="${i18n.t('E-mail')}" required class="w-full border px-3 py-2 rounded" />
					<input type="password" id="password" placeholder="${i18n.t('Password')}" required class="w-full border px-3 py-2 rounded" />
					<div id="errorMessage" style="color: red; margin-top: 10px;"></div>
					<button type="submit" id="sign-in-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
					${i18n.t('Sign in')}
					</button>
				</form>

				<div class="flex items-center gap-2 text-sm text-gray-500">
					<hr class="flex-1 border-gray-300" />
				</div>

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
				errorMessageDiv.textContent = result.message;
			} else {
				alert('Sign-in successful, welcome ' + result.user + '!');
				localStorage.setItem('token', result.token);

				window.location.href = '/auth?from=signin';
				// navigate('/auth?from=signin');
				//! Change for prod!
				// navigate('/home');
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
		emailInput.placeholder = i18n.t('signin:E-mail');
		passwordInput.placeholder = i18n.t('signin:Password');
		signUpBtn.textContent = i18n.t('Sign in');
	});
	wrapper.appendChild(langSelector.getElement());
}
