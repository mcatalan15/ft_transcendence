import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';
import { navigate } from '../utils/router';

export function showHistory(container: HTMLElement): void {
  console.log('showFriends ejecutado', container);
  i18n
    .loadNamespaces('friends')
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

      const langSelector = new LanguageSelector(() => showHistory(container)).getElement();
      langSelector.classList.add(
        'row-start-1',
        hasMenu ? 'col-start-2' : 'col-start-1',
        'justify-self-end',
        'p-4',
        'z-40'
      );
      container.appendChild(langSelector);

      const arcadeBox = document.createElement('div');
      arcadeBox.className = `
        w-full max-w-[1800px] h-auto md:h-[750px]
        mx-auto bg-neutral-900 border-4 border-cyan-400
        flex flex-col md:flex-row overflow-hidden shadow-xl
        min-h-[600px]
      `.replace(/\s+/g, ' ').trim();

      const leftCol = document.createElement('div');
      leftCol.className = `
        w-full md:w-1/3 flex flex-col items-center
        bg-neutral-900 pt-6 pb-10 px-4 h-full relative
      `.replace(/\s+/g, ' ').trim();

      const profileTitle = document.createElement('div');
      profileTitle.className = `
        text-amber-50 text-2xl font-bold tracking-wide break-all text-left w-full mb-6
      `.replace(/\s+/g, ' ').trim();

      const avatar = document.createElement('img');
      avatar.src = 'https://randomuser.me/api/portraits/men/32.jpg';
      avatar.alt = 'Profile';
      avatar.className = `
        w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-amber-50 object-cover
        shadow-xl transition-all duration-300 mt-20
      `.replace(/\s+/g, ' ').trim();

      const nicknameSpan = document.createElement('span');
      nicknameSpan.className = `
        mt-6 text-amber-50 text-2xl font-bold tracking-wide break-all text-center w-full pl-2
      `.replace(/\s+/g, ' ').trim();
      nicknameSpan.textContent = '...';

      leftCol.appendChild(profileTitle);
      leftCol.appendChild(avatar);
      leftCol.appendChild(nicknameSpan);

      const rightCol = document.createElement('div');
      rightCol.className = `
        w-full md:w-2/3 flex flex-col bg-neutral-900
      `.replace(/\s+/g, ' ').trim();

      const matchTable

      arcadeBox.appendChild(leftCol);
      arcadeBox.appendChild(rightCol);
      
      contentWrapper.appendChild(arcadeBox);
      container.appendChild(contentWrapper);

      const headerWrapper = new Header().getElement();
      headerWrapper.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-30');
      container.appendChild(headerWrapper);

      fetch('/api/profile', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => {
          const username = data.username;
          profileTitle.textContent = i18n.t('friendsTitle', { ns: 'friends', username });
          nicknameSpan.textContent = username;
          if (data.avatar) avatar.src = data.avatar;
        })
        .catch(error => {
          navigate('/home');
          console.error('Error fetching profile:', error);
        });
    });
}
