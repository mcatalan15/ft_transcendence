import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';
import { navigate } from '../utils/router';

interface GameHistory {
  id_game: number;
  created_at: string;
  is_tournament: boolean;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  winner_name: string;
  player1_is_ai: boolean;
  player2_is_ai: boolean;
  game_mode: string;
  smart_contract_link?: string;
}

function createButton(color: string, text: string, action: () => void, disabled = false) {
  let btn = document.createElement('button');
  btn.type = 'button';
  btn.disabled = disabled;
  btn.className = `
    bg-${color}-950 text-${color}-400 border border-${color}-400 border-b-4
    font-medium overflow-hidden relative px-6 py-2 rounded-md
    hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75
    outline-none duration-300 group text-sm md:text-base
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `.replace(/\s+/g, ' ').trim();

  btn.innerHTML = `
    <span class="bg-${color}-400 shadow-${color}-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
    ${text}
  `;
  if (!disabled) {
    btn.onclick = action;
  }
  return btn;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createGameRow(game: GameHistory, currentUser: string): HTMLElement {
  const row = document.createElement('tr');
  row.className = 'border-b border-amber-50/20 hover:bg-amber-50/5 transition-colors';

  const isWinner = game.winner_name === currentUser;
  const opponent = game.player1_name === currentUser ? game.player2_name : game.player1_name;
  const isPlayer1 = game.player1_name === currentUser;
  const userScore = isPlayer1 ? game.player1_score : game.player2_score;
  const opponentScore = isPlayer1 ? game.player2_score : game.player1_score;
  const opponentIsAI = isPlayer1 ? game.player2_is_ai : game.player1_is_ai;

  row.innerHTML = `
    <td class="px-4 py-3 text-amber-50 text-sm">
      ${formatDate(game.created_at)}
    </td>
    <td class="px-4 py-3 text-amber-50 text-sm">
      ${opponent}${opponentIsAI ? ' (AI)' : ''}
    </td>
    <td class="px-4 py-3 text-amber-50 text-sm font-bold">
      ${userScore} - ${opponentScore}
    </td>
    <td class="px-4 py-3 text-sm">
      <span class="px-2 py-1 rounded-full text-xs font-medium ${
        isWinner 
          ? 'bg-green-900 text-green-400 border border-green-400' 
          : 'bg-red-900 text-red-400 border border-red-400'
      }">
        ${isWinner ? (i18n.t('victory', { ns: 'history' }) || 'Victory') : (i18n.t('defeat', { ns: 'history' }) || 'Defeat')}
      </span>
    </td>
    <td class="px-4 py-3 text-amber-50 text-sm">
      ${game.game_mode || 'Classic'}
    </td>
    <td class="px-4 py-3 text-amber-50 text-sm">
      ${game.is_tournament ? (i18n.t('yes', { ns: 'history' }) || 'Yes') : (i18n.t('no', { ns: 'history' }) || 'No')}
    </td>
    <td class="px-4 py-3 text-amber-50 text-sm">
      ${game.smart_contract_link ? 
        `<a href="${game.smart_contract_link}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">View</a>` : 
        '-'
      }
    </td>
  `;

  return row;
}

export async function showHistory(container: HTMLElement): Promise<void> {
  const currentUser = sessionStorage.getItem('username');
  let currentPage = 0;
  const gamesPerPage = 10;
  let totalGames = 0;
  let games: GameHistory[] = [];

  await i18n.loadNamespaces('history');

  container.innerHTML = '';
  const hasMenu = false;

  if (hasMenu) {
    container.className = [
      'grid',
      'grid-rows-[auto_1fr]',
      'grid-cols-[200px_1fr]',
      'h-screen',
      'overflow-hidden'
    ].join(' ');
  } else {
    container.className = [
      'grid',
      'grid-rows-[auto_1fr]',
      'h-screen',
      'overflow-hidden'
    ].join(' ');
  }

  const headerWrapper = new Header().getElement();
  headerWrapper.classList.add(
    'row-start-1',
    hasMenu ? 'col-span-2' : 'col-span-1',
    'w-full',
    'z-30'
  );
  container.appendChild(headerWrapper);

  const langSelector = new LanguageSelector(() => showHistory(container)).getElement();
  langSelector.classList.add(
    'row-start-1',
    hasMenu ? 'col-start-2' : 'col-start-1',
    'justify-self-end',
    'p-4',
    'z-40'
  );
  container.appendChild(langSelector);

  if (hasMenu) {
    const menuWrapper = new Menu().getElement();
    menuWrapper.classList.add(
      'row-start-2',
      'col-start-1',
      'h-full',
      'overflow-auto',
      'bg-gray-50',
      'border-r',
      'z-20'
    );
    container.appendChild(menuWrapper);
  }

  const contentWrapper = document.createElement('div');
  contentWrapper.className = [
    'row-start-2',
    hasMenu ? 'col-start-2' : 'col-start-1',
    'flex',
    'items-center',
    'justify-center',
    'w-full',
    'h-full',
    'bg-neutral-900',
    'p-4'
  ].join(' ');

  const historyBox = document.createElement('div');
  historyBox.className = `
    w-full max-w-[1400px] h-auto
    mx-auto bg-neutral-900 border-4 border-amber-50
    flex flex-col overflow-hidden shadow-xl
    min-h-[600px]
  `.replace(/\s+/g, ' ').trim();

  // Header section
  const headerSection = document.createElement('div');
  headerSection.className = `
    bg-neutral-900 px-6 py-6 border-b border-amber-50/20
  `.replace(/\s+/g, ' ').trim();

  const historyTitle = document.createElement('h1');
  historyTitle.className = `
    text-amber-50 text-3xl font-bold tracking-wide text-center mb-4
  `.replace(/\s+/g, ' ').trim();
  historyTitle.textContent = i18n.t('gameHistory', { ns: 'history' }) || 'Game History';

  // Navigation controls
  const navControls = document.createElement('div');
  navControls.className = 'flex justify-between items-center';

  const pageInfo = document.createElement('div');
  pageInfo.className = 'text-amber-50 text-sm';
  pageInfo.id = 'pageInfo';

  const navButtons = document.createElement('div');
  navButtons.className = 'flex gap-2';

  const prevButton = createButton('cyan', '← Previous', () => {
    if (currentPage > 0) {
      currentPage--;
      loadGames();
    }
  });
  prevButton.id = 'prevButton';

  const nextButton = createButton('cyan', 'Next →', () => {
    if ((currentPage + 1) * gamesPerPage < totalGames) {
      currentPage++;
      loadGames();
    }
  });
  nextButton.id = 'nextButton';

  const newestButton = createButton('lime', 'Newest', () => {
    currentPage = 0;
    loadGames();
  });

  const oldestButton = createButton('amber', 'Oldest', () => {
    currentPage = Math.max(0, Math.ceil(totalGames / gamesPerPage) - 1);
    loadGames();
  });

  navButtons.appendChild(newestButton);
  navButtons.appendChild(prevButton);
  navButtons.appendChild(nextButton);
  navButtons.appendChild(oldestButton);

  navControls.appendChild(pageInfo);
  navControls.appendChild(navButtons);

  headerSection.appendChild(historyTitle);
  headerSection.appendChild(navControls);

  // Table section
  const tableSection = document.createElement('div');
  tableSection.className = `
    flex-1 overflow-auto bg-neutral-900 px-6 py-4
  `.replace(/\s+/g, ' ').trim();

  const table = document.createElement('table');
  table.className = 'w-full';

  const tableHeader = document.createElement('thead');
  tableHeader.innerHTML = `
    <tr class="border-b-2 border-amber-50">
      <th class="px-4 py-3 text-left text-amber-50 font-bold text-sm uppercase tracking-wider">
        ${i18n.t('date', { ns: 'history' }) || 'Date'}
      </th>
      <th class="px-4 py-3 text-left text-amber-50 font-bold text-sm uppercase tracking-wider">
        ${i18n.t('opponent', { ns: 'history' }) || 'Opponent'}
      </th>
      <th class="px-4 py-3 text-left text-amber-50 font-bold text-sm uppercase tracking-wider">
        ${i18n.t('score', { ns: 'history' }) || 'Score'}
      </th>
      <th class="px-4 py-3 text-left text-amber-50 font-bold text-sm uppercase tracking-wider">
        ${i18n.t('result', { ns: 'history' }) || 'Result'}
      </th>
      <th class="px-4 py-3 text-left text-amber-50 font-bold text-sm uppercase tracking-wider">
        ${i18n.t('mode', { ns: 'history' }) || 'Mode'}
      </th>
      <th class="px-4 py-3 text-left text-amber-50 font-bold text-sm uppercase tracking-wider">
        ${i18n.t('tournament', { ns: 'history' }) || 'Tournament'}
      </th>
      <th class="px-4 py-3 text-left text-amber-50 font-bold text-sm uppercase tracking-wider">
        ${i18n.t('contract', { ns: 'history' }) || 'Contract'}
      </th>
    </tr>
  `;

  const tableBody = document.createElement('tbody');
  tableBody.id = 'gamesTableBody';

  table.appendChild(tableHeader);
  table.appendChild(tableBody);
  tableSection.appendChild(table);

  // Loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loadingState';
  loadingDiv.className = 'flex items-center justify-center h-40';
  loadingDiv.innerHTML = `
    <div class="text-amber-50 text-lg">
      ${i18n.t('loading', { ns: 'history' }) || 'Loading games...'}
    </div>
  `;
  tableSection.appendChild(loadingDiv);

  // Empty state
  const emptyDiv = document.createElement('div');
  emptyDiv.id = 'emptyState';
  emptyDiv.className = 'hidden flex-col items-center justify-center h-40';
  emptyDiv.innerHTML = `
    <div class="text-amber-50 text-lg mb-4">
      ${i18n.t('noGames', { ns: 'history' }) || 'No games found'}
    </div>
    <button class="bg-cyan-950 text-cyan-400 border border-cyan-400 px-6 py-2 rounded-md hover:brightness-150 transition" onclick="navigate('/game')">
      ${i18n.t('playFirstGame', { ns: 'history' }) || 'Play Your First Game'}
    </button>
  `;
  tableSection.appendChild(emptyDiv);

  historyBox.appendChild(headerSection);
  historyBox.appendChild(tableSection);
  contentWrapper.appendChild(historyBox);
  container.appendChild(contentWrapper);

  // Load games function
  async function loadGames() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const tableBody = document.getElementById('gamesTableBody');
    const pageInfoEl = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevButton') as HTMLButtonElement;
    const nextBtn = document.getElementById('nextButton') as HTMLButtonElement;

    if (loadingState) loadingState.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (tableBody) tableBody.innerHTML = '';

    try {
      const response = await fetch(`/api/games/history?page=${currentPage}&limit=${gamesPerPage}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      games = data.games || [];
      totalGames = data.total || 0;

      if (loadingState) loadingState.classList.add('hidden');

      if (games.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (pageInfoEl) pageInfoEl.textContent = '';
      } else {
        // Populate table
        if (tableBody && currentUser) {
          games.forEach(game => {
            const row = createGameRow(game, currentUser);
            tableBody.appendChild(row);
          });
        }

        // Update pagination info
        const startGame = currentPage * gamesPerPage + 1;
        const endGame = Math.min((currentPage + 1) * gamesPerPage, totalGames);
        if (pageInfoEl) {
          pageInfoEl.textContent = `${i18n.t('showing', { ns: 'history' }) || 'Showing'} ${startGame}-${endGame} ${i18n.t('of', { ns: 'history' }) || 'of'} ${totalGames} ${i18n.t('games', { ns: 'history' }) || 'games'}`;
        }
      }

      // Update button states
      if (prevBtn) {
        prevBtn.disabled = currentPage === 0;
        prevBtn.className = prevBtn.className.replace(/opacity-50|cursor-not-allowed/g, '');
        if (currentPage === 0) {
          prevBtn.className += ' opacity-50 cursor-not-allowed';
        }
      }

      if (nextBtn) {
        const hasNext = (currentPage + 1) * gamesPerPage < totalGames;
        nextBtn.disabled = !hasNext;
        nextBtn.className = nextBtn.className.replace(/opacity-50|cursor-not-allowed/g, '');
        if (!hasNext) {
          nextBtn.className += ' opacity-50 cursor-not-allowed';
        }
      }

    } catch (error) {
      console.error('Error loading games:', error);
      if (loadingState) loadingState.classList.add('hidden');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="px-4 py-8 text-center text-red-400">
              ${i18n.t('errorLoading', { ns: 'history' }) || 'Error loading games. Please try again.'}
            </td>
          </tr>
        `;
      }
    }
  }

  // Initial load
  loadGames();
}