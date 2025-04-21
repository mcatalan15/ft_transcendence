export type CredentialResponse = {
	clientId: string;
	credential: string;
	select_by: string;
  };  

export function initializeGoogleSignIn(onSuccess: (token: string) => void) {
	window.onload = () => {
	  window.google?.accounts.id.initialize({
		client_id: "49814417427-6kej25nd57avgbpp6k7fgphe9pmtshvf.apps.googleusercontent.com",
		callback: (response: google.accounts.id.CredentialResponse) => {
		  const credential = response.credential;
		  if (credential) {
			onSuccess(credential);
		  } else {
			console.warn("Google Sign-In failed: No credential returned.");
		  }
		}
	  });
  
	  window.google?.accounts.id.prompt();
	};
  }

export {};

declare global {
	interface Window {
		google: typeof google;
	}
}