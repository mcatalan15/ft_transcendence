import i18n from '../i18n';

export function showAuth(container: HTMLElement): void {
    // Parse URL parameters to check where the user came from
    const urlParams = new URLSearchParams(window.location.search);
    const fromPage = urlParams.get('from');
    
    // Create the main container
    const authDiv = document.createElement('div');
    authDiv.className = "auth-container";
    
    // Different content based on where the user came from
    if (fromPage === 'signup') {
  		console.log('signup')
        // Show signup success message
        const message = document.createElement('p');
        message.textContent = i18n.t('You have successfully created an account!');
        
        const continueButton = document.createElement('button');
        continueButton.textContent = i18n.t('Continue to App');
        continueButton.addEventListener('click', () => {
            // Direct assignment for more reliable navigation
            window.location.href = '/home';
        });
        
        authDiv.appendChild(message);
        authDiv.appendChild(continueButton);
    } else if (fromPage === 'signin') {
        // Show signin success message
        console.log('signin')
        const message = document.createElement('p');
        message.textContent = i18n.t('You have successfully signed in!');
        
        const continueButton = document.createElement('button');
        continueButton.textContent = i18n.t('Continue to App');
        continueButton.addEventListener('click', () => {
            // Direct assignment for more reliable navigation
            window.location.href = '/home';
        });
        
        authDiv.appendChild(message);
        authDiv.appendChild(continueButton);
    } else {
        // Default view if direct access to auth page
			console.log('else');
        const message = document.createElement('p');
        message.textContent = i18n.t('Please sign in or create an account');
        authDiv.appendChild(message);
    }
    
    container.appendChild(authDiv);
}