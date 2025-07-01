import { loadGames, GameHistory } from '../utils/matchHistory/gameUtils';
import { MatchTableComponent } from '../components/profileComponents/history/table';
import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';
import { PongBoxComponent } from '../components/profileComponents/pongBox';

export function showHistory(container: HTMLElement) {
  const currentPage = 0;
  const gamesPerPage = 10;

  const matchTableComponent = new MatchTableComponent([]);

  i18n
    .loadNamespaces('history')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      container.innerHTML = '';

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'flex flex-col items-center justify-center w-full h-full bg-neutral-900';

      const tableWrapper = document.createElement('div');
      tableWrapper.className = "w-full flex justify-center p-8";

      tableWrapper.appendChild(matchTableComponent.getElement());

      contentWrapper.appendChild(tableWrapper);
      container.appendChild(contentWrapper);

      const headerWrapper = new Header().getElement();
      headerWrapper.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-30');
      container.appendChild(headerWrapper);

      const langSelector = new LanguageSelector(() => showHistory(container)).getElement();
      contentWrapper.appendChild(langSelector);

      const pongBox = new PongBoxComponent({
        title: '',
        avatarUrl: '',
        nickname: '',
        mainContent: tableWrapper
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
            titleEl.textContent = i18n.t('historyTitle', { ns: 'history', username: data.username });
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

      // Load games and update table
      loadGames(currentPage, gamesPerPage)
      .then(({ games }) => {
        if (games.length === 0) {
          console.warn('No games found.');
          matchTableComponent.updateData([]);
          return;
        }
    
        const currentUser = sessionStorage.getItem('username') || '';
        const matchRows = games.map((game) => ({
          date: new Date(game.created_at).toLocaleString(),
          opponent: game.player1_name === currentUser ? game.player2_name : game.player1_name,
          score: `${game.player1_score} - ${game.player2_score}`,
          mode: game.game_mode || 'Classic',
          contract: game.smart_contract_link
            ? `<a href="${game.smart_contract_link}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">View</a>`
            : '-',
        }));
        matchTableComponent.updateData(matchRows);
      })
      .catch((error) => {
        console.error('Error loading games:', error);
        matchTableComponent.updateData([]);
      });
}