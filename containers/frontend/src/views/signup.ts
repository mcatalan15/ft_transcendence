import { localSignUp } from "../auth/localSignUp";

function loadGoogleScript(): void {
	if (document.getElementById('google-script')) return;

	const script = document.createElement('script');
	script.src = 'https://accounts.google.com/gsi/client';
	script.id = 'google-script';
	script.async = true;
	script.defer = true;
	document.head.appendChild(script);
}

export function showSignUp(container: HTMLElement): void {
	loadGoogleScript();

	const SignUpDiv = document.createElement('div');
	SignUpDiv.innerHTML = `
		<div class="h-screen flex items-center justify-center text-amber-50 bg-gradient-to-br from-neutral-900">
			<div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6">
				<h2 class="text-2xl font-semibold text-center">Let's start!</h2>

				<form id="login-form" class="space-y-4">
					<input type="nickname" id="nickname" placeholder="Nickname" required class="w-full border px-3 py-2 rounded" />
					<input type="email" id="email" placeholder="Email" required class="w-full border px-3 py-2 rounded" />
					<input type="password" id="password" placeholder="Password" required class="w-full border px-3 py-2 rounded" />
					<input type="password" id="confirmPassword" placeholder="Confirm Password" required class="w-full border px-3 py-2 rounded" />
					<button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
						Sign up
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
	`;

	const form = SignUpDiv.querySelector('#login-form') as HTMLFormElement;
	const errorMessageDiv = document.createElement('div');
	errorMessageDiv.style.color = 'red';
	errorMessageDiv.style.marginTop = '10px';
	SignUpDiv.appendChild(errorMessageDiv);
	form.onsubmit = async (e) => {
		e.preventDefault();
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
		if (!/^[a-zA-Z0-9]+$/.test(username)) {
			errorMessageDiv.textContent = 'Username can only contain letters, numbers!';
			return;
		}		

		if (password === confirmPassword) {
			const result = await localSignUp(username, email, password);
      
			if (!result.success) {
			  // Display the error message from the backend
			  errorMessageDiv.textContent = result.message;
			} else {
			  // Registration successful - redirect or show success message
			  alert('Registration successful!');
			  navigate('/signin');
			}
		  } else {
			errorMessageDiv.textContent = 'Passwords do not match!';
		  }
	};
	container.appendChild(SignUpDiv);
  }
