import i18n from '../i18n';
import { HeaderTest } from '../components/generalComponents/testmenu';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { PongBoxComponent } from '../components/profileComponents/pongBoxComponents/pongBox';
import { HeadersComponent } from '../components/profileComponents/pongBoxComponents/headersComponent';
import { translateDOM } from '../utils/translateDOM';
import { navigate } from '../utils/router';

export function showFriends(container: HTMLElement): void {
  i18n
    .loadNamespaces('friends')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
      container.innerHTML = '';
      const hasMenu = false;

      const langSelector = new LanguageSelector(() => showFriends(container)).getElement();
      langSelector.classList.add(
        'row-start-1',
        hasMenu ? 'col-start-2' : 'col-start-1',
        'justify-self-end',
        'p-4',
        'z-40'
      );
      container.appendChild(langSelector);
      // Header decorativo reutilizable con estilo globalizado
      const lang = i18n.language || 'en';
      const svgHeader = new HeadersComponent({
        type: 'friends',
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

      // Agrupar PongBox en un wrapper para controlar el flujo
      const mainColumn = document.createElement('div');
      mainColumn.className = 'flex flex-col items-center w-full';

      // Preparar mainContent para PongBoxComponent
      const rightCol = document.createElement('div');
      rightCol.className = `overscroll-contain w-full md:w-2/3 flex flex-col bg-neutral-900 relative`.replace(/\s+/g, ' ').trim();


      // Search bar
      const searchBarWrapper = document.createElement('div');
      searchBarWrapper.className = 'flex w-full justify-end items-center mt-2 mb-2 pr-6 z-30';
      searchBarWrapper.innerHTML = `
        <div class="p-5 overflow-hidden w-[60px] h-[60px] hover:w-[270px] bg-lime-400 shadow-[2px_2px_20px_rgba(0,0,0,0.08)] rounded-full flex group items-center transition-all duration-300">
          <div class="flex items-center justify-items-end-safe fill-white">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"></path>
            </svg>
          </div>
          <input
            type="text"
            id="search-input"
            placeholder="${i18n.t('searchPlaceholder', { ns: 'friends' })}"
            class="outline-none text-[20px] bg-transparent w-full text-white font-normal px-4 border-0 focus:ring-0 placeholder:text-amber-50"
            style="min-width:0"
          />
        </div>
      `;

      // Lista de amigos
      const friendsList = document.createElement('div');
      friendsList.className = `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full justify-items-center pt-2`.replace(/\s+/g, ' ').trim();

      // Store friends data for search functionality
      let friendsData = [];

      // Function to render friends
      function renderFriends(friends) {
        friendsList.innerHTML = '';
        if (friends.length === 0) {
          const empty = document.createElement('div');
          empty.textContent = 'No friends found';
          empty.className = 'col-span-full text-lime-200 opacity-70 mt-8 text-center';
          friendsList.appendChild(empty);
          return;
        }

        friends.forEach((friend, idx) => {
          const friendDiv = document.createElement('div');
          friendDiv.className = 'flex flex-col items-center w-full max-w-[100px] md:max-w-[120px] mx-auto cursor-pointer';
          
          // Add click handler to navigate to friend's profile
          friendDiv.addEventListener('click', () => {
            navigate(`/profile/${friend.username}`);
          });

          const friendAvatar = document.createElement('img');
          friendAvatar.src = `/api/profile/avatar/${friend.id_user}?t=${Date.now()}`;
          friendAvatar.alt = friend.username;
          friendAvatar.className = 'w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-lime-400 object-cover shadow transition duration-200 hover:scale-105';

          const friendName = document.createElement('span');
          friendName.className = 'mt-2 text-lime-200 font-semibold text-xs md:text-base truncate max-w-[80px] text-center';
          friendName.textContent = friend.username;

          friendDiv.appendChild(friendAvatar);
          friendDiv.appendChild(friendName);

          friendsList.appendChild(friendDiv);
        });
      }

      // Fetch friends from API
      fetch('/api/friends', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          friendsData = data.friends;
          renderFriends(friendsData);
        } else {
          const errorDiv = document.createElement('div');
          errorDiv.textContent = 'Error loading friends list';
          errorDiv.className = 'col-span-full text-red-400 mt-8 text-center';
          friendsList.appendChild(errorDiv);
        }
      })
      .catch(error => {
        console.error('Error fetching friends:', error);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Error loading friends list';
        errorDiv.className = 'col-span-full text-red-400 mt-8 text-center';
        friendsList.appendChild(errorDiv);
      });

      const searchInput = searchBarWrapper.querySelector('input');
      searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase();
        renderFriends(friendsData.filter(f =>
          f.username.toLowerCase().includes(value)
        ));
      });

      rightCol.appendChild(searchBarWrapper);
      rightCol.appendChild(friendsList);

      // Obtener datos de usuario para PongBoxComponent
      const userId = sessionStorage.getItem('userId') || 'defaultUserId';
      const avatarUrl = `/api/profile/avatar/${userId}?t=${Date.now()}`;
      let username = '...';
      let friendsTitle = i18n.t('friendsTitle', { ns: 'friends', username });

      // This info will be updated after fetching the profile
      const pongBox = new PongBoxComponent({
        avatarUrl,
        nickname: username,
        mainContent: rightCol
      });

      const headerPongBoxWrapper = document.createElement('div');
      headerPongBoxWrapper.className = 'relative flex flex-col items-center w-full';


      // Ajuste responsivo del margen superior
      const borderMobile = 8;
      const borderDesktop = 16;
      function updateSvgMargin() {
        const isMobile = window.innerWidth < 768;
        svgHeader.style.marginTop = `-${isMobile ? borderMobile * 3.2 : borderDesktop * 3.4}px`;
      }
      updateSvgMargin();
      window.addEventListener('resize', updateSvgMargin);

      const pongBoxEl = pongBox.getElement();
      pongBoxEl.style.marginTop = '-16px';

      headerPongBoxWrapper.appendChild(svgHeader);
      headerPongBoxWrapper.appendChild(pongBoxEl);
      mainColumn.appendChild(headerPongBoxWrapper);
      container.appendChild(mainColumn);

      const headerWrapper = new HeaderTest().getElement();
      headerWrapper.classList.add(
        'row-start-1',
        hasMenu ? 'col-span-2' : 'col-span-1',
        'w-full',
        'z-30'
      );
      container.appendChild(headerWrapper);

      fetch('/api/profile', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(response => response.json())
        .then(data => {
          username = data.username;
          friendsTitle = i18n.t('friendsTitle', { ns: 'friends', username });
          // Actualizar título y nickname en PongBoxComponent
          const box = pongBox.getElement();
          const titleDiv = box.querySelector('div.text-amber-50.text-7xl');
          if (titleDiv) titleDiv.textContent = friendsTitle;
          const nickSpan = box.querySelector('span.text-amber-50.text-2xl');
          if (nickSpan) nickSpan.textContent = username;
          const avatarImg = box.querySelector('img[alt="Profile"]');
          if (avatarImg && data.avatar) (avatarImg as HTMLImageElement).src = data.avatar;
        })
        .catch(error => {
          navigate('/home');
          console.error('Error fetching profile:', error);
        });
    });
}