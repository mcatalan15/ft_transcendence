import i18n from '../i18n';

export function showAuth(container: HTMLElement): void {
    // Parse URL parameters to check where the user came from
    const urlParams = new URLSearchParams(window.location.search);
    const fromPage = urlParams.get('from');
    
    // Add debugging to see what's happening
    console.log('Current URL:', window.location.href);
    console.log('URL params:', urlParams.toString());
    console.log('fromPage value:', fromPage);
    
    // Create the main container
    const authDiv = document.createElement('div');
    authDiv.className = "auth-container";
    
    // Different content based on where the user came from
    if (fromPage === 'signup') {
        console.log('Showing signup success');
        // Show signup success message
        // --- NEW: API Call Integration for 'signup' success ---
        const apiMessageDiv = document.createElement('p');
        apiMessageDiv.textContent = 'Fetching message from API...'; // Initial loading message
        authDiv.appendChild(apiMessageDiv); // Add a placeholder for API response
        // Function to call our backend API
        const fetchHelloMessage = async () => {
            try {
                // IMPORTANT: Replace 'http://localhost:3000' with your actual backend API URL
                const response = await fetch('http://localhost:3000/hello');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: HelloResponse = await response.json();
                apiMessageDiv.textContent = `API Says: "${data.message}"`; // Update with API response
                console.log('API response:', data.message);
            } catch (error) {
                console.error("Error fetching hello message from API:", error);
                apiMessageDiv.textContent = `Failed to fetch message from API: ${error.message}`;
            }
        };
    
        // Call the API when the 'signup' success page loads
        fetchHelloMessage();
        // --- END NEW ---onst message = document.createElement('p');
        message.textContent = i18n.t('You have successfully created an account!');
        
        const continueButton = document.createElement('button');
        continueButton.textContent = i18n.t('Continue to App');
        continueButton.addEventListener('click', () => {
            // Clear the URL parameters when continuing
            window.location.href = '/home';
        });
        
        authDiv.appendChild(message);
        authDiv.appendChild(continueButton);
    } else if (fromPage === 'signin') {
        console.log('Showing signin success');
        // Show signin success message
        const message = document.createElement('p');
        message.textContent = i18n.t('You have successfully signed in!');
        
        const continueButton = document.createElement('button');
        continueButton.textContent = i18n.t('Continue to App');
        continueButton.addEventListener('click', () => {
            // Clear the URL parameters when continuing
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