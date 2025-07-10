import { initGame } from '../pong/pong';
import { HeaderTest } from '../components/generalComponents/testmenu'
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { Preconfiguration } from '../pong/utils/GameConfig';
import i18n from '../i18n';

export function showPong(container: HTMLElement): void {
    const urlParams = new URLSearchParams(window.location.search);
    const isFromInvitation = urlParams.get('invitation') === 'true';
    const inviteId = urlParams.get('inviteId');
    
    // Create preconfiguration object
    const preconfiguration: Preconfiguration = {
        mode: 'local', // default
        variant: '1v1', // default
        classicMode: false,
        hasInvitationContext: false,
        invitationData: null
    };

    if (isFromInvitation && inviteId) {
        console.log('🎮 Pong started via chat invitation:', inviteId);
        
        // Update preconfiguration for invitation context
        preconfiguration.mode = 'online';
        preconfiguration.hasInvitationContext = true;
        preconfiguration.invitationData = {
            inviteId: inviteId,
            currentPlayer: sessionStorage.getItem('username') || 'Unknown',
            timestamp: new Date().toISOString()
        };
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

            // Pass preconfiguration to initGame
            initGame(container, preconfiguration);
        });
}