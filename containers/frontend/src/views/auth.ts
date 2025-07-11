import i18n from '../i18n';
import { getApiUrl } from '../config/api';

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
	authDiv.className = 'h-screen flex items-center justify-center bg-neutral-900';

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
		twoFaBox.className = 'bg-neutral-800 border-2 border-amber-50 p-8 max-w-md w-full mx-auto';
		twoFaBox.innerHTML = `
		<h2 class="text-4xl font-bold mb-6 text-center text-amber-50 font-anatol uppercase tracking-wider">${i18n.t('Two-Factor Verification')}</h2>
		<p class="text-amber-50 mb-6 font-mono text-sm opacity-80">${i18n.t('Please enter your 6-digit authentication code')}</p>
		<div class="space-y-6">
		<input
			type="text"
			id="twoFaTokenInput"
			placeholder="${i18n.t('123456')}"
			maxlength="6"
			class="w-full px-4 py-3 bg-neutral-800 border-2 border-amber-50 text-center italic text-sm tracking-widest text-amber-50 font-mono focus:outline-none focus:border-amber-400"
		  >
		  <button
			id="verifyTwoFaBtn"
			class="gaming-button w-full py-3 text-amber-50 font-mono font-bold text-sm uppercase tracking-wider transition-all duration-300"
		  >
			${i18n.t('Verify')}
		  </button>
		  <p id="verificationStatus" class="text-sm text-center text-amber-50 font-mono"></p>
		</div>
	  `;
		authDiv.appendChild(twoFaBox);

		const tokenInput = twoFaBox.querySelector('#twoFaTokenInput') as HTMLInputElement;
		const verifyBtn = twoFaBox.querySelector('#verifyTwoFaBtn') as HTMLButtonElement;
		const verificationStatus = twoFaBox.querySelector('#verificationStatus') as HTMLParagraphElement;

		setupGamingButton(verifyBtn, 'amber');

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
				const response = await fetch(getApiUrl('/auth/verify'), {
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
			<div class="h-screen flex items-center justify-center text-amber-50">
			  <div class="bg-neutral-800 border-2 border-amber-50 p-10 w-full max-w-md space-y-8">
				<h2 class="text-4xl font-bold text-center text-amber-50 font-anatol uppercase tracking-wider">${i18n.t('Two-Factor Authentication Setup')}</h2>
				<div class="space-y-6">
				  <p class="text-amber-50 font-mono text-sm opacity-80">${i18n.t('Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).')}</p>
				  <div class="qr-code-display flex justify-center items-center bg-neutral-800">
					<p class="text-amber-50 font-mono text-sm">${i18n.t('Loading QR code...')}</p>
				  </div>
				  <div class="text-amber-50 font-mono text-sm">
					<p class="opacity-80 mb-2">${i18n.t('Or manually enter this secret key:')}</p>
					<div class="secret-key bg-amber-50 border border-amber-50 p-3 text-center font-mono text-xs tracking-widest text-neutral-900">${i18n.t('Loading secret...')}</div>
				  </div>
				  <div class="verification-input space-y-4">
					<input
					  type="text"
					  id="twoFaTokenInput"
					  placeholder="${i18n.t('Enter 6-digit code')}"
					  maxlength="6"
					  class="w-full bg-neutral-800 border-2 border-amber-50 px-4 py-3 text-center text-sm italic font-mono tracking-widest text-amber-50 focus:outline-none focus:border-amber-400"
					>
					<button
					  id="verifyTwoFaBtn"
					  class="gaming-button w-full py-3 text-amber-50 font-mono font-bold text-sm uppercase tracking-wider transition-all duration-300"
					>
					  ${i18n.t('Verify 2FA')}
					</button>
					<p class="verification-status text-sm text-center font-mono text-amber-50"></p>
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
		const setupVerifyBtn = twoFaSection.querySelector('#verifyTwoFaBtn') as HTMLButtonElement;
		const verificationStatus = twoFaSection.querySelector('.verification-status') as HTMLParagraphElement;

		setupGamingButton(setupVerifyBtn, 'amber');

		const initiateTwoFaSetup = async () => {
			if (!actualUserId || !actualUsername || !actualEmail) {
				const errorMessage = i18n.t('Cannot set up 2FA: User data missing. Please try signing up again.');
				console.error(errorMessage);
				qrCodeDisplay.textContent = errorMessage;
				secretKeySpan.textContent = errorMessage;
				return;
			}

			try {
				const response = await fetch(getApiUrl('/auth/setup'), {
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

		setupVerifyBtn.addEventListener('click', async () => {
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
				const response = await fetch(getApiUrl('/auth/verify'), {
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

function setupGamingButton(button: HTMLButtonElement, color: 'amber' | 'lime' | 'cyan' | 'pink'): void {
	const colorMap = {
		'lime': '#84cc16',
		'cyan': '#22d3ee', 
		'pink': '#f472b6',
		'amber': '#FFFBEB'
	};
	
	const buttonColor = colorMap[color];
	
	Object.assign(button.style, {
		backgroundColor: 'transparent',
		border: `2px solid ${buttonColor}`,
		color: buttonColor,
		fontFamily: '"Roboto Mono", monospace',
		fontWeight: 'bold',
		fontSize: '12px',
		textTransform: 'uppercase',
		borderRadius: '0px',
		cursor: 'pointer',
		transition: 'all 0.3s ease'
	});
	
	button.addEventListener('mouseenter', () => {
		button.style.backgroundColor = buttonColor;
		button.style.color = '#171717';
	});
	
	button.addEventListener('mouseleave', () => {
		button.style.backgroundColor = 'transparent';
		button.style.color = buttonColor;
	});
}