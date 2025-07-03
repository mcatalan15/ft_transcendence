import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';
import { MatchTableComponent } from '../components/profileComponents/history/table';
import { PongBoxComponent } from '../components/profileComponents/pongBox';
import { getApiUrl } from '../config/api';

export function showHistory(container: HTMLElement) {
  
  i18n
    .loadNamespaces('history')
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
      container.appendChild(langSelector);


      //mirar como reccuperar esta informacion
      const matchResults = [
        { song: 'The Sliding Mr. Bones (Next Stop, Pottersville)', artist: 'Malcolm Lockyer', year: 1961 },
        { song: 'Witchy Woman', artist: 'The Eagles', year: 1972 },
        { song: 'Shining Star', artist: 'Earth, Wind, and Fire', year: 1975 }
      ];
      const matchTableComponent = new MatchTableComponent(matchResults);
      const tableWrapper = document.createElement('div');
      tableWrapper.className = "w-full flex justify-center p-8";
      tableWrapper.appendChild(matchTableComponent.getElement());

      const pongBox = new PongBoxComponent({
        title: '',
        avatarUrl: '...',
        nickname: '...',
        mainContent: tableWrapper
      });

      contentWrapper.appendChild(pongBox.getElement());
      container.appendChild(contentWrapper);

      const headerWrapper = new Header().getElement();
      headerWrapper.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-30');
      container.appendChild(headerWrapper);

      fetch(getApiUrl('/profile'), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => {
          const pongBoxElement = pongBox.getElement();
          const titleEl = pongBoxElement.querySelector('div.text-cyan-400');
          const nicknameEl = pongBoxElement.querySelector('span.text-cyan-400');
          const avatarImg = pongBoxElement.querySelector('img');

          if (titleEl)
            titleEl.textContent = i18n.t('historyTitle', { ns: 'history', username: data.username });
          if (nicknameEl)
            nicknameEl.textContent = data.username;
          if (avatarImg && data.avatar)
            (avatarImg as HTMLImageElement).src = `/api/profile/avatar/${data.userId}?t=${Date.now()}`;
        })
        .catch(error => {
          navigate('/home');
          console.error('Error fetching profile:', error);
        });

      // ----------- EXTRA: FUNCIÓN PARA ACTUALIZAR LA TABLA DINÁMICAMENTE -----------
      function updateTable(newData) {
        tableWrapper.innerHTML = '';
        const newTable = new MatchTableComponent(newData);
        tableWrapper.appendChild(newTable.getElement());
      }

      // // Ejemplo de cómo usar updateTable:
      // setTimeout(() => {
      //   updateTable([
      //     ...matchResults,
      //     { song: 'Nueva Canción', artist: 'Nuevo Artista', year: 2025 }
      //   ]);
      // }, 3000);
    });
}