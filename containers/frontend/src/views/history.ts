import { loadGames, GameHistory } from '../utils/matchHistory/gameUtils';
import { MatchTableComponent } from '../components/profileComponents/history/table';
import i18n from '../i18n';
import { HeaderTest } from '../components/generalComponents/testmenu';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { navigate } from '../utils/router';
import { PongBoxComponent } from '../components/profileComponents/pongBoxComponents/pongBox';
import { HeadersComponent } from '../components/profileComponents/pongBoxComponents/headersComponent';
import { Pagination } from '../components/generalComponents/Pagination';

export function showHistory(container: HTMLElement) {
  let currentPage = 0;
  const gamesPerPage = 8;
  let totalGames = 0;
  let totalPages = 1;

  const matchTableComponent = new MatchTableComponent([]);
  let paginationComponent: Pagination | null = null;

  function renderView() {
    i18n
      .loadNamespaces('history')
      .then(() => i18n.changeLanguage(i18n.language))
      .then(() => {
        container.innerHTML = '';

        // Language selector y testmenu arriba
        const topBar = document.createElement('div');
        topBar.className = 'w-full flex flex-row justify-between items-center px-8 pt-4';
        // Language selector
        const langSelector = new LanguageSelector(() => showHistory(container)).getElement();
        // Testmenu
        const testMenu = new HeaderTest().getElement();
        topBar.appendChild(langSelector);
        topBar.appendChild(testMenu);

      const lang = i18n.language || 'en';
      const svgHeader = new HeadersComponent({
        type: 'history',
        lang,
        className: 'absolute left-1/2 -translate-x-1/2 top-0 z-30 w-full max-w-[1800px] h-auto pointer-events-none select-none',
        style: {
          marginTop: '0',
          top: '0',
          transform: 'translateX(-50%)',
          position: 'absolute',
          width: '100%',
          maxWidth: '1800px',
          height: 'auto',
          zIndex: '30',
          pointerEvents: 'none',
          userSelect: 'none',
          bottom: 'unset',
          left: '50%',
          right: 'unset',
          display: 'block',
          marginBottom: '0',
          marginLeft: '0',
          marginRight: '0',
        }
      }).getElement();

      // Ajuste responsivo del margen superior
      const borderMobile = 8;
      const borderDesktop = 16; 
      function updateSvgMargin() {
        const isMobile = window.innerWidth < 768;
        svgHeader.style.marginTop = `-${isMobile ? borderMobile * 3.2 : borderDesktop * 3.4}px`;
      }
      updateSvgMargin();
      window.addEventListener('resize', updateSvgMargin);

        // Estructura principal
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'flex flex-col items-center justify-center w-full h-full bg-neutral-900';


        const tableWrapper = document.createElement('div');
        tableWrapper.className = "w-full flex justify-center p-8 min-h-[200px]";
        tableWrapper.appendChild(matchTableComponent.getElement());




        // Paginación perfectamente centrada respecto a la tabla
        const paginationWrapper = document.createElement('div');
        paginationWrapper.className = 'w-full flex justify-center';
        if (paginationComponent) {
          paginationWrapper.appendChild(paginationComponent.getElement());
        }

        // PongBox clásico con paginación dentro
        const pongBoxContent = document.createElement('div');
        pongBoxContent.className = 'flex flex-col w-full';
        pongBoxContent.appendChild(tableWrapper);
        pongBoxContent.appendChild(paginationWrapper);

        const pongBox = new PongBoxComponent({
          avatarUrl: '',
          nickname: '',
          mainContent: pongBoxContent
        });
        const pongBoxElement = pongBox.getElement();
        pongBoxElement.style.marginTop = '-16px';

        const mainColumn = document.createElement('div');
        mainColumn.className = 'flex flex-col items-center w-full';
        const headerPongBoxWrapper = document.createElement('div');
        headerPongBoxWrapper.className = 'relative flex flex-col items-center w-full';
        headerPongBoxWrapper.appendChild(svgHeader);
        headerPongBoxWrapper.appendChild(pongBoxElement);
        mainColumn.appendChild(headerPongBoxWrapper);

        contentWrapper.appendChild(topBar);
        contentWrapper.appendChild(mainColumn);
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
  }

  function loadAndRenderGames() {
    loadGames(currentPage, gamesPerPage)
      .then(({ games, totalGames: total }) => {
        totalGames = total;
        totalPages = Math.max(1, Math.ceil(totalGames / gamesPerPage));

        if (!paginationComponent) {
          paginationComponent = new Pagination({
            currentPage,
            totalPages,
            onPageChange: (page: number) => {
              currentPage = page;
              loadAndRenderGames();
            },
          });
        } else {
          paginationComponent.update(currentPage, totalPages);
        }

        if (games.length === 0) {
          matchTableComponent.updateData([]);
          renderView();
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
        renderView();
      })
      .catch((error) => {
        console.error('Error loading games:', error);
        matchTableComponent.updateData([]);
        renderView();
      });
  }

  loadAndRenderGames();
}