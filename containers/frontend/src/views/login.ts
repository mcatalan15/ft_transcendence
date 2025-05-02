import { localSignUp } from '../auth/localSignUp';

export function showLogin(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
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
			<style>
				input[type="text"], input[type="email"], input[type="password"] {
					background-color: #333;
					color: #fff;
					border: 1px solid #555;
					padding: 6px;
					border-radius: 4px;
				}
			</style>
			<button style='margin-right:16px' type="button" id="signUpButton">Sign Up</button>
			<button style='margin-right:16px' onclick="navigate('/')">Return home</button>
		</form>
	`;

	const signUpButton = homeDiv.querySelector('#signUpButton') as HTMLButtonElement;
	signUpButton.addEventListener('click', () => {
		const username = (homeDiv.querySelector('#username') as HTMLInputElement).value;
		const email = (homeDiv.querySelector('#email') as HTMLInputElement).value;
		const password = (homeDiv.querySelector('#password') as HTMLInputElement).value;
		const confirmPassword = (homeDiv.querySelector('#confirmPassword') as HTMLInputElement).value;

		if (password === confirmPassword) {
			localSignUp( username, email, password );
		} else {
			alert('Passwords do not match!');
		}
	});
	container.appendChild(homeDiv);
  }
