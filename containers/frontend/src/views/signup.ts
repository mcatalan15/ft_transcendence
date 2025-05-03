import { localSignUp } from '../auth/localSignUp';

export function showSignUp(container: HTMLElement): void {
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

		    <div id="errorMessage" style="color: red; margin-top: 10px;"></div>

			<button style='margin-right:16px' type="button" id="signUpButton">Sign Up</button>
			<button style='margin-right:16px' onclick="navigate('/')">Return home</button>
		</form>
	`;

	const signUpButton = homeDiv.querySelector('#signUpButton') as HTMLButtonElement;
	const errorMessageDiv = homeDiv.querySelector('#errorMessage') as HTMLDivElement;

	signUpButton.addEventListener('click', async () => {
		const username = (homeDiv.querySelector('#username') as HTMLInputElement).value;
		const email = (homeDiv.querySelector('#email') as HTMLInputElement).value;
		const password = (homeDiv.querySelector('#password') as HTMLInputElement).value;
		const confirmPassword = (homeDiv.querySelector('#confirmPassword') as HTMLInputElement).value;

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
			  navigate('/');
			}
		  } else {
			errorMessageDiv.textContent = 'Passwords do not match!';
		  }
	});
	container.appendChild(homeDiv);
  }
