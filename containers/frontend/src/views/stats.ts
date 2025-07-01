import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';
import { PongBoxComponent } from '../components/profileComponents/pongBox';

export function showStats(container: HTMLElement) {
  i18n
    .loadNamespaces('history')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      container.innerHTML = '';

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'flex flex-col items-center justify-center w-full h-full bg-neutral-900';
      container.appendChild(contentWrapper);
      
      const langSelector = new LanguageSelector(() => showStats(container)).getElement();
      container.appendChild(langSelector);
    
      const pongBox = new PongBoxComponent({
        title: '',
        avatarUrl: '',
        nickname: '',
        mainContent: document.createElement('div'),
      });

      const pongBoxElement = pongBox.getElement();
      contentWrapper.appendChild(pongBoxElement);
      container.appendChild(contentWrapper);

      fetch('/api/profile', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => {
          const titleEl = pongBoxElement.querySelector('div.text-amber-50');
          const nicknameEl = pongBoxElement.querySelector('span.text-amber-50');
          const avatarImg = pongBoxElement.querySelector('img');

          if (titleEl)
            titleEl.textContent = i18n.t('statsTitle', { ns: 'stats', username: data.username });
          if (nicknameEl)
            nicknameEl.textContent = data.username;
          if (avatarImg && data.userId)
            (avatarImg as HTMLImageElement).src = `/api/profile/avatar/${data.userId}?t=${Date.now()}`;
        })
        .catch(error => {
          navigate('/home');
          console.error('Error fetching profile:', error);
        });
    });
}