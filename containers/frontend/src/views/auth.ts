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
    // Parse URL parameters to check where the user came from
    const urlParams = new URLSearchParams(window.location.search);
    const fromPage = urlParams.get('from');

    // Add debugging to see what's happening
    console.log('Current URL:', window.location.href);
    console.log('URL params:', urlParams.toString());
    console.log('fromPage value:', fromPage);
    console.log(sessionStorage.getItem('userId'));
    console.log(sessionStorage.getItem('username'));
    // Create the main container
    const authDiv = document.createElement('div');
    authDiv.className = "auth-container";

    // --- IMPORTANT: Variables to hold the actual user data ---
    let actualUserId = sessionStorage.getItem('userId');
    let actualUsername = sessionStorage.getItem('username');

    // Different content based on where the user came from
    if (fromPage === 'signup') {
        console.log('Showing signup success and initiating 2FA setup');

        const message = document.createElement('p');
        message.textContent = i18n.t('You have successfully created an account!');
        authDiv.appendChild(message);

        // --- Retrieve user data from localStorage after signup redirect ---
        const storedUserId = localStorage.getItem('signupUserId');
        const storedUsername = localStorage.getItem('signupUsername');

        if (storedUserId && storedUsername) {
            actualUserId = parseInt(storedUserId, 10);
            actualUsername = storedUsername;
            // IMPORTANT: Clear localStorage items after use to prevent stale data
            localStorage.removeItem('signupUserId');
            localStorage.removeItem('signupUsername');
            console.log(`[2FA Setup] Retrieved userId: ${actualUserId}, username: ${actualUsername} from localStorage.`);
        } else {
            // Fallback for direct access or if signup process didn't store data
            console.warn('[2FA Setup] User ID or username not found in localStorage. This might happen on direct page access or if signup flow is incomplete.');
            // You might want to redirect to signup/signin here if data is missing,
            // or just allow the page to render with default behavior (which might lead to errors).
            // For now, we'll let it fail with a more descriptive error message during fetch.
        }

        // --- 2FA Setup Section ---
        const twoFaSection = document.createElement('div');
        twoFaSection.className = 'twofa-section';
        twoFaSection.innerHTML = `
            <h3>${i18n.t('Two-Factor Authentication Setup')}</h3>
            <p>${i18n.t('Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).')}</p>
            <div class="qr-code-display">
                <p>${i18n.t('Loading QR code...')}</p>
            </div>
            <p>${i18n.t('Or manually enter this secret key:')} <strong class="secret-key">${i18n.t('Loading secret...')}</strong></p>
            <div class="verification-input">
                <input type="text" id="twoFaTokenInput" placeholder="${i18n.t('Enter 6-digit code')}" maxlength="6">
                <button id="verifyTwoFaBtn">${i18n.t('Verify 2FA')}</button>
                <p class="verification-status"></p>
            </div>
        `;
        authDiv.appendChild(twoFaSection);

        // Get references to the elements we just created
        const qrCodeDisplay = twoFaSection.querySelector('.qr-code-display') as HTMLDivElement;
        const secretKeySpan = twoFaSection.querySelector('.secret-key') as HTMLElement;
        const tokenInput = twoFaSection.querySelector('#twoFaTokenInput') as HTMLInputElement;
        const verifyBtn = twoFaSection.querySelector('#verifyTwoFaBtn') as HTMLButtonElement;
        const verificationStatus = twoFaSection.querySelector('.verification-status') as HTMLParagraphElement;


        // Function to call our backend API to initiate 2FA setup
        const initiateTwoFaSetup = async () => {
            if (actualUserId === null || actualUsername === null) {
                const errorMessage = i18n.t('Cannot set up 2FA: User data missing. Please try signing up again.');
                console.error(errorMessage);
                qrCodeDisplay.textContent = errorMessage;
                secretKeySpan.textContent = errorMessage;
                return; // Stop execution if data is missing
            }

            try {
                // Using relative path, assuming your proxy/server setup handles it
                const response = await fetch('/api/auth/setup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // !!! Pass the actual user data here !!!
                    body: JSON.stringify({ username: actualUsername, userId: actualUserId })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message}`);
                }
                const data: TwoFaSetupResponse = await response.json();

                // Display the QR code and secret
                qrCodeDisplay.innerHTML = `<img src="${data.qrCodeUrl}" alt="${i18n.t('2FA QR Code')}" width="200" height="200"/>`;
                secretKeySpan.textContent = data.secret;
                console.log('2FA Setup Data:', data);

            } catch (error: any) {
                console.error("Error initiating 2FA setup:", error);
                qrCodeDisplay.textContent = `${i18n.t('Failed to load QR code:')} ${error.message}`;
                secretKeySpan.textContent = `${i18n.t('Error:')} ${error.message}`;
            }
        };

        // Call the 2FA setup API when the signup success page loads
        initiateTwoFaSetup();

        // --- Event listener for 2FA verification ---
        verifyBtn.addEventListener('click', async () => {
            const token = tokenInput.value.trim();

            if (actualUserId === null) {
                const errorMessage = i18n.t('Cannot verify 2FA: User ID missing. Please try signing up again.');
                verificationStatus.textContent = errorMessage;
                verificationStatus.style.color = 'red';
                console.error(errorMessage);
                return; // Stop execution if data is missing
            }

            if (!token || !/^[0-9]{6}$/.test(token)) {
                verificationStatus.textContent = i18n.t('Please enter a valid 6-digit code.');
                verificationStatus.style.color = 'red';
                return;
            }

            try {
                // Using relative path, assuming your proxy/server setup handles it
                const response = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // !!! Pass the actual user data here !!!
                    body: JSON.stringify({ userId: actualUserId, token })
                });

                const data: TwoFaVerifyResponse = await response.json();

                if (response.ok && data.verified) {
                    verificationStatus.textContent = i18n.t('2FA successfully verified! You can now proceed.');
                    verificationStatus.style.color = 'green';
                    // Optional: Disable input/button after successful verification
                    tokenInput.disabled = true;
                    verifyBtn.disabled = true;
                } else {
                    verificationStatus.textContent = i18n.t(data.message || 'Verification failed. Please try again.');
                    verificationStatus.style.color = 'red';
                }
            } catch (error: any) {
                console.error("Error verifying 2FA token:", error);
                verificationStatus.textContent = i18n.t(`Error during verification: ${error.message}`);
                verificationStatus.style.color = 'red';
            }
        });

        // --- Continue Button ---
        const continueButton = document.createElement('button');
        continueButton.textContent = i18n.t('Continue to App');
        continueButton.addEventListener('click', () => {
            // After successful 2FA setup, the user should typically sign in
            // For production, ensure 2FA is verified before allowing navigation.
            window.location.href = '/signin'; // Redirect to sign-in after 2FA setup
        });
        authDiv.appendChild(continueButton);

    } else if (fromPage === 'signin') {
        console.log('Showing signin success');
        const message = document.createElement('p');
        message.textContent = i18n.t('You have successfully signed in!');

        const continueButton = document.createElement('button');
        continueButton.textContent = i18n.t('Continue to App');
        continueButton.addEventListener('click', () => {
            window.location.href = '/home';
        });

        authDiv.appendChild(message);
        authDiv.appendChild(continueButton);
    } else {
        // Default view if direct access to auth page
        console.log('Showing default auth view, fromPage:', fromPage);
        const message = document.createElement('p');
        message.textContent = i18n.t('Please sign in or create an account');
        authDiv.appendChild(message);
    }

    container.appendChild(authDiv);
}