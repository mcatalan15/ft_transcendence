import { initGame } from '../pong/pong';
import { HeaderTest } from '../components/generalComponents/testmenu'
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import i18n from '../i18n';

export function showPong(container: HTMLElement): void {
	const urlParams = new URLSearchParams(window.location.search);
	const isFromInvitation = urlParams.get('invitation') === 'true';
	const inviteId = urlParams.get('inviteId');
	
	if (isFromInvitation) {
		console.log('🎮 Pong started via chat invitation:', inviteId);
	} else {
		console.log('🎮 Pong started via manual navigation');
	}

	i18n
		.loadNamespaces('history')
		.then(() => i18n.changeLanguage(i18n.language))
		.then(() => {
		container.innerHTML = '';
		
		const headerWrapper = new HeaderTest().getElement();
		headerWrapper.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-30');
		container.appendChild(headerWrapper);

		const langSelector = new LanguageSelector(() => showPong(container)).getElement();
		container.appendChild(langSelector);

		// Pass the invitation context to initGame if needed
		if (isFromInvitation && inviteId) {
			initGame(container); //! AUTOGAME HERE
		} else {
			initGame(container);
		}
	});
}