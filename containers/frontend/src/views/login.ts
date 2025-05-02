export function showLogin(container: HTMLElement): void
{
	const loginDiv = document.createElement('div');
	loginDiv.innerHTML = `
		<div class="h-screen flex items-center justify-center text-amber-50">
			<div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-8">
				<script src="https://accounts.google.com/gsi/client" async></script>
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
	`;
	container.appendChild(loginDiv);
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