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

			<button style='margin-right:16px' type="submit">Sign Up</button>
			<button style='margin-right:16px' onclick="navigate('/')">Return home</button>
		</form>
	`;
	container.appendChild(homeDiv);
  }
  