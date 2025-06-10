/* import { removeFriend } from '../utils/profile/friends';

export function showFriends(container: HTMLElement): void {
    // Clear the container first
    container.innerHTML = '';

    const friendsDiv = document.createElement('div');
    friendsDiv.innerHTML = `
        <h1>My Friends</h1>
        <div id="friendsList">Loading friends...</div>
		<button onclick="navigate('/profile')">Back to Profile</button><div>
        <button onclick="navigate('/home')">Back to Home</button>
    `;

    container.appendChild(friendsDiv);

    const friendsList = friendsDiv.querySelector('#friendsList') as HTMLDivElement;

    // Fetch friends list
    fetch('/api/friends', {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.friends.length === 0) {
                    friendsList.innerHTML = `
                        <p>You don't have any friends yet.</p>
                        <p>Visit other users' profiles to add them as friends!</p>
                    `;
                } else {
                    friendsList.innerHTML = `
                        <p>You have ${data.friends.length} friend${data.friends.length > 1 ? 's' : ''}:</p>
                        <ul style="list-style-type: none; padding: 0;">
                            ${data.friends.map(friend => `
                                <li style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; gap: 10px;">
                                    <img src="/api/profile/avatar/${friend.id_user}" 
                                         alt="${friend.username}'s avatar" 
                                         style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                    <div style="flex-grow: 1;">
                                        <strong>${friend.username}</strong>
                                        <br>
                                        <small>Friends since: ${new Date(friend.created_at).toLocaleDateString()}</small>
                                    </div>
                                    <button onclick="navigate('/profile/${friend.username}')" 
                                            style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                                        View Profile
                                    </button>
                                    <button onclick="removeFriendFromList('${friend.username}')" 
                                            style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                                        Remove
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }
            } else {
                friendsList.innerHTML = '<p>Error loading friends list.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
            friendsList.innerHTML = '<p>Error loading friends list.</p>';
        });
}

(window as any).removeFriendFromList = async function (username: string) {
    if (!confirm(`Are you sure you want to remove ${username} from your friends?`)) {
        return;
    }
    removeFriend(username, () => {
        showFriends(document.getElementById('app') as HTMLElement);
    });
}; */

import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';
import { navigate } from '../utils/router';

export function showFriends(container: HTMLElement): void {
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

      const langSelector = new LanguageSelector(() => showFriends(container)).getElement();
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
        mx-auto bg-neutral-900 border-4 border-white-400
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
      const userId = sessionStorage.getItem('userId') || 'defaultUserId';
      avatar.src = `/api/profile/avatar/${userId}?t=${Date.now()}`;
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

      const searchBarWrapper = document.createElement('div');
      searchBarWrapper.className = 'flex w-full justify-end items-end mt-8 -ml-8';
      searchBarWrapper.innerHTML = `
      <div
      class="p-5 overflow-hidden w-[60px] h-[60px] hover:w-[270px] bg-lime-400 shadow-[2px_2px_20px_rgba(0,0,0,0.08)] rounded-full flex group items-center transition-all duration-300"
      >
        <div class="flex items-center justify-items-end-safe fill-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
          >
            <path
              d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          id="search-input"
          placeholder="Search friends..."
          class="outline-none text-[20px] bg-transparent w-full text-white font-normal px-4 border-0 focus:ring-0 placeholder:text-amber-50"
          style="min-width:0";
        />
      </div>
    </div>

      `;

      // Lista de amigos
      const friendsList = document.createElement('div');
      friendsList.className = `
        grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-48 w-full justify-items-center
      `.replace(/\s+/g, ' ').trim();

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
          friendsData = data.friends; // Store the data
          renderFriends(friendsData); // Render all friends initially
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

      // Filtro búsqueda
      const searchInput = searchBarWrapper.querySelector('input');
      searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase();
        renderFriends(friendsData.filter(f =>
          f.username.toLowerCase().includes(value)
        ));
      });

      rightCol.appendChild(searchBarWrapper);
      rightCol.appendChild(friendsList);

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