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
		<div class="h-screen flex items-center justify-center text-amber-50 bg-gradient-to-br from-neutral-900">
			<div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6">
				<h2 class="text-2xl font-semibold text-center">Let's play!</h2>

				<form id="login-form" class="space-y-4">
					<input type="email" id="email" placeholder="Email" required class="w-full border px-3 py-2 rounded" />
					<input type="password" id="password" placeholder="Password" required class="w-full border px-3 py-2 rounded" />
					<button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
						Sign In
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

	const form = SignInDiv.querySelector('#login-form') as HTMLFormElement;
	const emailInput = SignInDiv.querySelector('#email') as HTMLInputElement;
	const passwordInput = SignInDiv.querySelector('#password') as HTMLInputElement;
	const errorMessageDiv = document.createElement('div');
	errorMessageDiv.style.color = 'red';
	errorMessageDiv.style.marginTop = '10px';
	SignInDiv.appendChild(errorMessageDiv);
	form.onsubmit = async (e) => {
		e.preventDefault();
		const email = emailInput.value;
		const password = passwordInput.value;
		errorMessageDiv.textContent = '';
		if (email && password) {
			const result = await localSignIn(email, password);
			if (!result.success) {
				// Display the error message from the backend
				errorMessageDiv.textContent = result.message;
			} else {
				// Sign-in successful - redirect or show success message
				alert('Sign-in successful!');
				navigate('/home');
			}
		} else {
			errorMessageDiv.textContent = 'Please fill in all fields';
		}
	};

	container.appendChild(SignInDiv);
}
/*
<h1>Log in or Sign up</h1>
  <form id="signupForm">
	  <label style='margin-right:16px' for="username">Username:</label>
	  <input type="text" id="username" name="username" required><br><br>

	  <label style='margin-right:16px' for="email">Email:</label>
	  <input type="email" id="email" name="email" required><br><br>

	  <label style='margin-right:16px' for="password">Password:</label>
	  <input type="password" id="password" name="password" required><br><br>

	  <label style='margin-right:16px' for="confirmPassword">Confirm Password:</label>
	  <input type="password" id="confirmPassword" name="confirmPassword" required><br><br>

	  <button style='margin-right:16px' type="submit">Sign Up</button>
	  <button style='margin-right:16px' onclick="navigate('/')">Return home</button>
  </form>*/


	/* 
	//ver con nicolas esta parte
	const form = document.getElementById('login-form') as HTMLFormElement;
	form.onsubmit = (e) => {
		e.preventDefault();
		const email = (document.getElementById('email') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;

		// Simulación 
		if (email && password) {
			localStorage.setItem('user', email);
			navigate('/home');
		} else {
			alert('Por favor, completa todos los campos');
		}*/