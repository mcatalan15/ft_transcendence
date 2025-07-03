import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';
import { PongBoxComponent } from '../components/profileComponents/pongBox';
import { getApiUrl } from '../config/api';

export function showScore(container: HTMLElement) {
  i18n
    .loadNamespaces('score')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      container.innerHTML = '';
      const hasMenu = false;

      const contentWrapper = document.createElement('div');
      contentWrapper.className = [
        'row-start-2',
        hasMenu ? 'col-start-2' : 'col-start-1',
        'flex',
        'items-center',
        'justify-center',
        'w-full',
        'h-full',
        'bg-neutral-900'
      ].join(' ');

      const langSelector = new LanguageSelector(() => showScore(container)).getElement();
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

      fetch(getApiUrl('/profile'), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => {
          const titleEl = pongBoxElement.querySelector('div.text-amber-50');
          const nicknameEl = pongBoxElement.querySelector('span.text-amber-50');
          const avatarImg = pongBoxElement.querySelector('img');

          if (titleEl)
            titleEl.textContent = i18n.t('scoreTitle', { ns: 'score', username: data.username });
          if (nicknameEl)
            nicknameEl.textContent = data.username;
          if (avatarImg && data.avatar)
            (avatarImg as HTMLImageElement).src = data.avatar;
        })
        .catch(error => {
          navigate('/home');
          console.error('Error fetching score:', error);
        });
    });
}