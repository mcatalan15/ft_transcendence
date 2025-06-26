import i18n from '../i18n';

// Define interfaces for API responses
interface TwoFaSetupResponse {
	secret: string;
	qrCodeUrl: string; // This is the data URL for the image
	otpAuthUrl: string; // The otpauth:// URI
}

interface TwoFaVerifyResponse {
	message: string;
	verified: boolean;
}

export function showAuth(container: HTMLElement): void {
	console.log('Hola!');
	const urlParams = new URLSearchParams(window.location.search);
	const fromPage = urlParams.get('from');
	console.log('Current URL:', window.location.href);
	console.log('URL params:', urlParams.toString());
	console.log('fromPage value:', fromPage);
	console.log('UserId:', sessionStorage.getItem('userId'));
	console.log('Username:', sessionStorage.getItem('username'));
	console.log('Email:', sessionStorage.getItem('email'));
	console.log('Auth Token:', sessionStorage.getItem('token') ? 'Present' : 'Missing');

	const authDiv = document.createElement('div');
	authDiv.className = 'auth-container';

	const actualUserId = sessionStorage.getItem('userId');
	const actualUsername = sessionStorage.getItem('username');
	const actualEmail = sessionStorage.getItem('email');
	let actual2FA = sessionStorage.getItem('twoFAEnabled');
	console.log(`[auth.ts] twoFAEnabled: ${actual2FA}`);

	if (!actualUserId || !actualUsername || !actualEmail) {
		console.error('Missing user data in sessionStorage, redirecting to signin');
		window.location.href = '/signin';
		return;
	}

	// Validate 2FA value - should be "0" (enabled) or "1" (disabled)
	if (actual2FA !== '0' && actual2FA !== '1') {
		console.warn('Invalid twoFAEnabled value, defaulting to 1 (disabled)');
		actual2FA = '1';
	}

	// Check if 2FA is enabled (0 = enabled, needs verification)
	if (actual2FA === '0') {
		console.log('Showing signin with 2FA verification');
		const twoFaBox = document.createElement('div');
		twoFaBox.className = 'bg-amber-50 rounded-xl shadow-xl p-6 max-w-md w-full mx-auto';
		twoFaBox.innerHTML = `
		<h2 class="text-xl font-semibold mb-4 text-center text-neutral-900">${i18n.t('Two-Factor Verification')}</h2>
		<p class="text-neutral-700 mb-4">${i18n.t('Please enter your 6-digit authentication code')}</p>
		<div class="space-y-4">
		<input
			type="text"
			id="twoFaTokenInput"
			placeholder="${i18n.t('123456')}"
			maxlength="6"
			class="w-full px-4 py-2 border rounded-lg text-center text-lg tracking-widest text-neutral-900"
		  >
		  <button
			id="verifyTwoFaBtn"
			class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
		  >
			${i18n.t('Verify')}
		  </button>
		  <p id="verificationStatus" class="text-sm text-center text-neutral-700"></p>
		</div>
	  `;
		authDiv.appendChild(twoFaBox);

		const tokenInput = twoFaBox.querySelector('#twoFaTokenInput') as HTMLInputElement;
		const verifyBtn = twoFaBox.querySelector('#verifyTwoFaBtn') as HTMLButtonElement;
		const verificationStatus = twoFaBox.querySelector('#verificationStatus') as HTMLParagraphElement;

		verifyBtn.addEventListener('click', async () => {
			const token = tokenInput.value.trim();
			if (!/^\d{6}$/.test(token)) {
				verificationStatus.textContent = i18n.t('Please enter a valid 6-digit code');
				verificationStatus.className = 'text-sm text-center text-red-500';
				return;
			}

			try {
				verifyBtn.disabled = true;
				verificationStatus.textContent = i18n.t('Verifying...');
				verificationStatus.className = 'text-sm text-center text-gray-500';
				const response = await fetch('/api/auth/verify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: actualUserId, token }),
				});

				const data = await response.json();
				if (response.ok && data.verified) {
					verificationStatus.textContent = i18n.t('Verification successful!');
					verificationStatus.className = 'text-sm text-center text-green-500';
					if (data.token) {
						sessionStorage.setItem('token', data.token);
					}
					setTimeout(() => {
						window.location.href = '/home';
					}, 1000);
				} else {
					throw new Error(data.message || 'Verification failed');
				}
			} catch (error) {
				verificationStatus.textContent = i18n.t(error.message);
				verificationStatus.className = 'text-sm text-center text-red-500';
				verifyBtn.disabled = false;
			}
		});

		tokenInput.addEventListener('input', () => {
			if (tokenInput.value.length === 6) {
				verifyBtn.click();
			}
		});
	} else {
		// 2FA is disabled (1) - show setup
		console.log('Showing signup success and initiating 2FA setup');
		const message = document.createElement('p');
		message.textContent = i18n.t('You have successfully created an account!');
		authDiv.appendChild(message);

		const twoFaSection = document.createElement('div');
		twoFaSection.className = 'fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden';
		twoFaSection.innerHTML = `
		<div class="relative h-full flex flex-col">
		  <div class="pt-6 w-full flex justify-center gap-x-4 z-30">
			<div class="h-screen flex items-center justify-center text-amber-50 bg-gradient-to-br from-neutral-900">
			  <div class="bg-amber-50 text-neutral-900 rounded-xl shadow-xl p-10 w-full max-w-md space-y-6">
				<h2 class="text-2xl font-semibold text-center">${i18n.t('Two-Factor Authentication Setup')}</h2>
				<div class="space-y-4">
				  <p class="text-neutral-700">${i18n.t('Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).')}</p>
				  <div class="qr-code-display flex justify-center items-center bg-white p-4 rounded border border-neutral-200">
					<p class="text-neutral-500">${i18n.t('Loading QR code...')}</p>
				  </div>
				  <p class="text-neutral-700">
					${i18n.t('Or manually enter this secret key:')}
					<strong class="secret-key block bg-neutral-100 p-2 rounded mt-1 text-center font-mono">${i18n.t('Loading secret...')}</strong>
				  </p>
				  <div class="verification-input space-y-2">
					<input
					  type="text"
					  id="twoFaTokenInput"
					  placeholder="${i18n.t('Enter 6-digit code')}"
					  maxlength="6"
					  class="w-full border px-3 py-2 rounded text-center font-mono tracking-widest"
					>
					<button
					  id="verifyTwoFaBtn"
					  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
					>
					  ${i18n.t('Verify 2FA')}
					</button>
					<p class="verification-status text-sm text-center"></p>
				  </div>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  `;
		authDiv.appendChild(twoFaSection);

		const qrCodeDisplay = twoFaSection.querySelector('.qr-code-display') as HTMLDivElement;
		const secretKeySpan = twoFaSection.querySelector('.secret-key') as HTMLElement;
		const tokenInput = twoFaSection.querySelector('#twoFaTokenInput') as HTMLInputElement;
		const verifyBtn = twoFaSection.querySelector('#verifyTwoFaBtn') as HTMLButtonElement;
		const verificationStatus = twoFaSection.querySelector('.verification-status') as HTMLParagraphElement;

		const initiateTwoFaSetup = async () => {
			if (!actualUserId || !actualUsername || !actualEmail) {
				const errorMessage = i18n.t('Cannot set up 2FA: User data missing. Please try signing up again.');
				console.error(errorMessage);
				qrCodeDisplay.textContent = errorMessage;
				secretKeySpan.textContent = errorMessage;
				return;
			}

			try {
				const response = await fetch('/api/auth/setup', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username: actualUsername, userId: actualUserId, email: actualEmail }),
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
					throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
				}
				const data: TwoFaSetupResponse = await response.json();
				qrCodeDisplay.innerHTML = `<img src="${data.qrCodeUrl}" alt="${i18n.t('2FA QR Code')}" width="200" height="200"/>`;
				secretKeySpan.textContent = data.secret;
				console.log('2FA Setup Data:', data);
			} catch (error: any) {
				console.error('Error initiating 2FA setup:', error);
				qrCodeDisplay.textContent = `${i18n.t('Failed to load QR code:')} ${error.message}`;
				secretKeySpan.textContent = `${i18n.t('Error:')} ${error.message}`;
			}
		};

		initiateTwoFaSetup();

		verifyBtn.addEventListener('click', async () => {
			const token = tokenInput.value.trim();
			if (!actualUserId) {
				const errorMessage = i18n.t('Cannot verify 2FA: User ID missing. Please try signing up again.');
				verificationStatus.textContent = errorMessage;
				verificationStatus.style.color = 'red';
				console.error(errorMessage);
				return;
			}

			if (!token || !/^[0-9]{6}$/.test(token)) {
				verificationStatus.textContent = i18n.t('Please enter a valid 6-digit code.');
				verificationStatus.style.color = 'red';
				return;
			}

			try {
				const response = await fetch('/api/auth/verify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: actualUserId, token }),
				});

				const data: TwoFaVerifyResponse & { token?: string, twoFAEnabled?: number } = await response.json();
				console.log('Frontend (Setup) received from /api/auth/verify:', data);

				if (response.ok && data.verified) {
					verificationStatus.textContent = i18n.t('2FA successfully verified! You can now proceed.');
					verificationStatus.style.color = 'green';
					if (data.token) {
						sessionStorage.setItem('token', data.token);
						console.log('Updated authToken in sessionStorage (Setup):', data.token ? 'Present' : 'Missing');
					}
					// Set to "0" (enabled) after successful verification
					sessionStorage.setItem('twoFAEnabled', '0');
					console.log('Updated twoFAEnabled in sessionStorage to "0" (enabled) after setup.');
					tokenInput.disabled = true;
					window.location.href = '/home';
				} else {
					verificationStatus.textContent = i18n.t(data.message || 'Verification failed. Please try again.');
					verificationStatus.style.color = 'red';
				}
			} catch (error: any) {
				console.error('Error verifying 2FA token:', error);
				verificationStatus.textContent = i18n.t(`Error during verification: ${error.message}`);
				verificationStatus.style.color = 'red';
			}
		});
	}

	container.appendChild(authDiv);
}