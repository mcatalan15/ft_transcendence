import i18n from '../i18n';
import { navigate } from '../utils/router';
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

export async function showAuth(container: HTMLElement): Promise<void> {

	await i18n.loadNamespaces('auth');
  	await i18n.changeLanguage(i18n.language);

	const urlParams = new URLSearchParams(window.location.search);
	const fromPage = urlParams.get('from');

	const authDiv = document.createElement('div');
	authDiv.className = 'h-screen flex items-center justify-center bg-neutral-900';

	const actualUserId = sessionStorage.getItem('userId');
	const actualUsername = sessionStorage.getItem('username');
	const actualEmail = sessionStorage.getItem('email');

	if (!actualUserId || !actualUsername || !actualEmail) {
		console.error('Missing user data in sessionStorage, redirecting to signin');
		navigate('/signin');
		return;
	}

	let actual2FA = '0';
	try {
		const response = await fetch(getApiUrl(`/auth/status/${actualUserId}`), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});

		if (response.ok) {
			const data = await response.json();

			// Extract 2FA values as variables
			const twoFAEnabled = data.twoFAEnabled;
			const twoFASecret = data.twoFASecret;

			// Update the actual2FA variable based on API response
			actual2FA = twoFAEnabled  === true ? '1' : '0';
		} else {
			console.error('Failed to fetch 2FA status:', response.statusText);
		}

	} catch (error) {
		console.error('Error calling 2FA status API:', error);
	}

	if (actual2FA === '1') {
		const twoFaBox = document.createElement('div');
		twoFaBox.className = 'bg-neutral-800 border-2 border-amber-50 p-8 max-w-md w-full mx-auto';
		twoFaBox.innerHTML = `
		<h2 class="text-4xl mb-6 text-center text-amber-50 font-anatol tracking-wider">${i18n.t('title', { ns: 'auth' })}</h2>
		<p class="text-amber-50 mb-6 font-mono text-sm opacity-80">${i18n.t('enterCode', { ns: 'auth' })}</p>
		<div class="space-y-6">
		<input
			type="text"
			id="twoFaTokenInput"
			placeholder="123456"
			maxlength="6"
			class="w-full px-4 py-3 bg-neutral-800 border-2 border-amber-50 text-center italic text-sm tracking-widest text-amber-50 font-mono focus:outline-none focus:border-amber-400"
		  >
		  <button
			id="verifyTwoFaBtn"
			class="gaming-button w-full py-3 text-amber-50 font-mono font-bold text-sm uppercase tracking-wider transition-all duration-300"
		  >
			${i18n.t('verify', { ns: 'auth' })}
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
				verificationStatus.textContent = i18n.t('error.enterValidCode', { ns: 'auth' });
				verificationStatus.className = 'text-sm text-center text-red-500';
				return;
			}

			try {
				verifyBtn.disabled = true;
				verificationStatus.textContent = i18n.t('verifying', { ns: 'auth' });
				verificationStatus.className = 'text-sm text-center text-gray-500';
				const response = await fetch(getApiUrl('/auth/verify'), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: actualUserId, token }),
					credentials: 'include' // Include cookies in the request
				});

				const data = await response.json();
				if (response.ok && data.verified) {
					verificationStatus.textContent = i18n.t('verificationSuccess', { ns: 'auth' });
					verificationStatus.className = 'text-sm text-center text-green-500';
					if (data.token) {
						sessionStorage.setItem('token', data.token);
					}
					setTimeout(() => {
						navigate('/home');
						return;
					}, 1000);
				} else {
					throw new Error(data.message || i18n.t('error.verificationFailed', { ns: 'auth' }));
				}
			} catch (error) {
				verificationStatus.textContent = i18n.t('error.unknownError', { ns: 'auth' });
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
		const message = document.createElement('p');
		message.textContent = i18n.t('2FASetupMessage', { ns: 'auth' });
		authDiv.appendChild(message);

		const twoFaSection = document.createElement('div');
		twoFaSection.className = 'fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden';
		twoFaSection.innerHTML = `
		<div class="relative h-full flex flex-col">
		  <div class="pt-6 w-full flex justify-center gap-x-4 z-30">
			<div class="h-screen flex items-center justify-center text-amber-50">
			  <div class="bg-neutral-800 border-2 border-amber-50 p-10 w-full max-w-md space-y-8">
				<h2 class="text-4xl text-center text-amber-50 font-anatol tracking-wider">${i18n.t('setup', { ns: 'auth' })}</h2>
				<div class="space-y-6">
				  <p class="text-amber-50 font-mono text-sm opacity-80">${i18n.t('scanInstructions', { ns: 'auth' })}</p>
				  <div class="qr-code-display flex justify-center items-center bg-neutral-800">
					<p class="text-amber-50 font-mono text-sm">${i18n.t('codeLoading', { ns: 'auth' })}</p>
				  </div>
				  <div class="text-amber-50 font-mono text-sm">
					<p class="opacity-80 mb-2">${i18n.t('manualEntry', { ns: 'auth' })}</p>
					<div class="secret-key bg-amber-50 border border-amber-50 p-3 text-center font-mono text-xs tracking-widest text-neutral-900">${i18n.t('Loading secret...')}</div>
				  </div>
				  <div class="verification-input space-y-4">
					<input
					  type="text"
					  id="twoFaTokenInput"
					  placeholder="${i18n.t('enterCodeShort', { ns: 'auth' })}"
					  maxlength="6"
					  class="w-full bg-neutral-800 border-2 border-amber-50 px-4 py-3 text-center text-sm italic font-mono tracking-widest text-amber-50 focus:outline-none focus:border-amber-400"
					>
					<button
					  id="verifyTwoFaBtn"
					  class="gaming-button w-full py-3 text-amber-50 font-mono font-bold text-sm uppercase tracking-wider transition-all duration-300"
					>
					  ${i18n.t('verify2FA', { ns: 'auth' })}
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
				const errorMessage = i18n.t('error.missingUserData', { ns: 'auth' });
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
				qrCodeDisplay.innerHTML = `<img src="${data.qrCodeUrl}" alt="${i18n.t('QRCode', { ns: 'auth' })}" width="200" height="200"/>`;
				secretKeySpan.textContent = data.secret;
			} catch (error: any) {
				console.error('Failed to load QR code: ', error);
				qrCodeDisplay.textContent = `${i18n.t('error.failedLoading', { ns: 'auth' })} ${error.message}`;
				secretKeySpan.textContent = `${i18n.t('error.error', { ns: 'auth' })} ${error.message}`;
			}
		};

		initiateTwoFaSetup();

		setupVerifyBtn.addEventListener('click', async () => {
			const token = tokenInput.value.trim();
			if (!actualUserId) {
				const errorMessage = i18n.t('error.missingUserId', { ns: 'auth' });
				verificationStatus.textContent = errorMessage;
				verificationStatus.style.color = 'red';
				console.error(errorMessage);
				return;
			}

			if (!token || !/^[0-9]{6}$/.test(token)) {
				verificationStatus.textContent = i18n.t('error.enterValidCode', { ns: 'auth' });
				verificationStatus.style.color = 'red';
				return;
			}

			try {
				const response = await fetch(getApiUrl('/auth/verify'), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: actualUserId, token }),
					credentials: 'include' // Include cookies in the request
				});

				const data: TwoFaVerifyResponse & { token?: string, twoFAEnabled?: number } = await response.json();

				if (response.ok && data.verified) {
					verificationStatus.textContent = i18n.t('verificationSuccessProceed', { ns: 'auth' });
					verificationStatus.style.color = 'green';
					if (data.token) {
						sessionStorage.setItem('token', data.token);
					}
					sessionStorage.setItem('twoFAEnabled', '1');
					tokenInput.disabled = true;
					navigate('/home');
					return;
				} else {
					verificationStatus.textContent = i18n.t(data.message || 'error.verificationFailed', { ns: 'auth' });
					verificationStatus.style.color = 'red';
				}
			} catch (error: any) {
				console.error('Error verifying 2FA token:', error);
				verificationStatus.textContent = i18n.t('error.errorDuringVerification', { ns: 'auth' }) + error.message;
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