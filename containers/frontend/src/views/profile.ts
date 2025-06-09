import { addFriend, removeFriend } from '../utils/profile/friends';

import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';
import { navigate } from '../utils/router';

function createButton(color: string, text: string, action: () => void) {
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `
      bg-${color}-950 text-${color}-400 border border-${color}-400 border-b-4
      font-medium overflow-hidden relative px-8 py-3 rounded-md
      hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75
      outline-none duration-300 group w-full max-w-xs text-base md:text-xl
    `.replace(/\s+/g, ' ').trim();

    btn.innerHTML = `
      <span class="bg-${color}-400 shadow-${color}-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
      ${text}
    `;
    btn.onclick = action;
    return btn;
  }

export async function showProfile(container: HTMLElement, username?: string): Promise<void> {

  const currentUser = sessionStorage.getItem('username');
  const isOwnProfile = !username || username === currentUser;

  const apiEndpoint = username ? `/api/profile/${username}` : '/api/profile';

  await i18n.loadNamespaces('profile');

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

  const langSelector = new LanguageSelector(() => showProfile(container)).getElement();
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
    'bg-neutral-900'
  ].join(' ');

  const pingpongBox = document.createElement('div');
  pingpongBox.className = `
    w-full max-w-[1800px] h-auto md:h-[750px]
    mx-auto bg-neutral-900 border-4 border-amber-50
    flex flex-col md:flex-row overflow-hidden shadow-xl
    min-h-[600px]
  `.replace(/\s+/g, ' ').trim();

  // LEFT COL
  const leftCol = document.createElement('div');
  leftCol.className = `
    w-full md:w-1/3 flex flex-col justify-items-start
    bg-neutral-900 pt-6 pb-10 px-4 h-full relative
  `.replace(/\s+/g, ' ').trim();

  const profileTitle = document.createElement('div');
  profileTitle.className = `
    text-amber-50 text-2xl font-bold tracking-wide break-all text-left w-full mb-6
  `.replace(/\s+/g, ' ').trim();

  const centerCol = document.createElement('div');
  centerCol.className = "flex flex-col place-items-center gap-4 w-full mt-32";

  const avatar = document.createElement('img');

  avatar.alt = 'Profile';
  avatar.className = `
    w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-amber-50 object-cover
    shadow-xl transition-all duration-300
  `.replace(/\s+/g, ' ').trim();

  const nicknameSpan = document.createElement('span');
  nicknameSpan.className = `
    mt-6 text-amber-50 text-2xl font-bold tracking-wide break-all text-center w-full pl-2
  `.replace(/\s+/g, ' ').trim();
  nicknameSpan.textContent = '...';

  centerCol.appendChild(avatar);
  centerCol.appendChild(nicknameSpan);

  leftCol.appendChild(profileTitle);
  leftCol.appendChild(centerCol);

  if (!isOwnProfile) {
	// Create a placeholder container for the friend button
	const friendButtonContainer = document.createElement('div');
	friendButtonContainer.id = 'friendButtonContainer';
	centerCol.appendChild(friendButtonContainer);

	const settingsRow = document.createElement('div');
	settingsRow.className = `
		w-full flex items-end py-56
	`.replace(/\s+/g, ' ').trim();

	const settingsIcon = document.createElement('span');
	settingsIcon.className = `
		inline-flex items-center justify-center cursor-pointer
		text-amber-50 hover:text-amber-100 transition
	`
	settingsIcon.title = i18n.t('settings', { ns: 'profile' }) || 'Ajustes';
	settingsIcon.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" fill="none"
			viewBox="0 0 24 24" stroke-width="1.5"
			stroke="currentColor" class="w-9 h-9">
		<path stroke-linecap="round" stroke-linejoin="round"
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.527-.98 3.362.855 2.382 2.382a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.98 1.527-.855 3.362-2.382 2.382a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.527.98-3.362-.855-2.382-2.382a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35A1.724 1.724 0 004.318 7.765c-.98-1.527.855-3.362 2.382-2.382.996.64 2.334.063 2.572-1.066z" />
		<path stroke-linecap="round" stroke-linejoin="round"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	`;
	settingsIcon.onclick = () => navigate('/settings');
	settingsRow.appendChild(settingsIcon);
	leftCol.appendChild(settingsRow);
  }  

  // MIDDLE COL
  const middleCol = document.createElement('div');
  middleCol.className = `
    w-full md:w-1/3 flex flex-col place-items-center mt-48
    bg-neutral-900 gap-6 px-6 py-8
  `.replace(/\s+/g, ' ').trim();

  const stat1 = document.createElement('div');
  stat1.className = 'text-lg md:text-xl text-amber-50 mb-1 md:mb-2 flex items-center gap-2 md:gap-3';
  stat1.innerHTML = `<span class="font-bold text-3xl md:text-4xl">0</span> <span>${i18n.t('matchesPlayed', { ns: 'profile' }) || 'Partidas jugadas'}</span>`;

  const stat2 = document.createElement('div');
  stat2.className = 'text-lg md:text-xl text-amber-50 mb-1 md:mb-2 flex items-center gap-2 md:gap-3';
  stat2.innerHTML = `<span class="font-bold text-3xl md:text-4xl">0</span> <span>${i18n.t('tournamentsPlayed', { ns: 'profile' }) || 'Torneos jugados'}</span>`;

  const stat3 = document.createElement('div');
  stat3.className = 'text-lg md:text-xl text-amber-50 mb-1 md:mb-2 flex items-center gap-2 md:gap-3';
  stat3.innerHTML = `<span class="font-bold text-3xl md:text-4xl">0</span> <span>${i18n.t('victories', { ns: 'profile' }) || 'Victorias'}</span>`;

  middleCol.appendChild(stat1);
  middleCol.appendChild(stat2);
  middleCol.appendChild(stat3);

  // RIGHT COL
  const rightCol = document.createElement('div');
  rightCol.className = `
    w-full md:w-1/3 flex flex-col justify-items-end-safe py-48 px-12 pr-24
    bg-neutral-900
  `.replace(/\s+/g, ' ').trim();

  const btnGrid = document.createElement('div');
  btnGrid.className = 'grid grid-cols-1 gap-5 md:gap-10 w-full max-w-xs ml-auto';

  const buttons = [
    {
      label: () => i18n.t('matches', { ns: 'profile' }) || 'Partidas',
      action: () => navigate('/matches'),
      color: 'cyan'
    },
    {
      label: () => i18n.t('friends', { ns: 'profile' }) || 'Amigos',
      action: () => navigate('/friends'),
      color: 'lime'
    },
	...(isOwnProfile ? [{
		label: () => i18n.t('settings', { ns: 'profile' }) || 'Ajustes',
		action: () => navigate('/settings'),
		color: 'amber'
	  }] : []),
    {
      label: () => i18n.t('stats', { ns: 'profile' }) || 'Estadísticas',
      action: () => navigate('/stats'),
      color: 'pink'
    }
  ];

  buttons.forEach(({ color, label, action }) => {
    const btn = createButton(color, label(), action);
    btnGrid.appendChild(btn);
  });

  pingpongBox.appendChild(leftCol);
  pingpongBox.appendChild(middleCol);
  pingpongBox.appendChild(rightCol);

  rightCol.appendChild(btnGrid);
  contentWrapper.appendChild(pingpongBox);
  container.appendChild(contentWrapper);

  // Espera a cargar el perfil
  fetch(apiEndpoint, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
  })
	.then(response => {
		// (404 = user not found)
		if (response.status === 404) {
			container.innerHTML = `
				<div style="text-align: center; margin-top: 50px;">
					<h1>User Not Found</h1>
					<p>The user "${username}" does not exist.</p>
					<button onclick="navigate('/home')" style="background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
						Back to Home
					</button>
				</div>
			`;
			return null; // Don't continue processing
		}
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	})

	.then(data => {
		if (!data) return;
	  
		const username = data.username;
	  
		if (isOwnProfile) {
		  profileTitle.textContent = i18n.t('profileTitleOwn', { ns: 'profile', username }) || `${username}'s profile`;
		} else {
		  profileTitle.textContent = i18n.t('profileTitle', { ns: 'profile', username }) || `${username}'s profile`;
		}
	  
		nicknameSpan.textContent = username;
		avatar.src = `/api/profile/avatar/${data.userId}?t=${Date.now()}`;
		
		// Update stats if they exist
		if (data.matchesPlayed !== undefined) {
		  stat1.querySelector('span.font-bold').textContent = data.matchesPlayed;
		}
		if (data.tournamentsPlayed !== undefined) {
		  stat2.querySelector('span.font-bold').textContent = data.tournamentsPlayed;
		}
		if (data.victories !== undefined) {
		  stat3.querySelector('span.font-bold').textContent = data.victories;
		}
	  
		// Handle friend button for other users' profiles
		if (!isOwnProfile) {
		  const friendButtonContainer = document.getElementById('friendButtonContainer');
		  if (friendButtonContainer) {
			// Clear any existing button
			friendButtonContainer.innerHTML = '';
			
			// Check if they are friends based on the API response
			if (data.isFriend) {
			  // Show Remove Friend button (red)
			  const removeFriendButton = createButton(
				'red',
				i18n.t('removeFriend', { ns: 'profile' }) || 'Remove Friend',
				async () => {
				  try {
					const response = await fetch('/api/friends/remove', {
					  method: 'DELETE',
					  headers: {
						'Content-Type': 'application/json',
					  },
					  credentials: 'include',
					  body: JSON.stringify({ username: username })
					});
					
					if (response.ok) {
					  // Refresh profile to update the button
					  showProfile(container, username);
					} else {
					  console.error('Failed to remove friend');
					}
				  } catch (error) {
					console.error('Error removing friend:', error);
				  }
				}
			  );
			  friendButtonContainer.appendChild(removeFriendButton);
			} else {
			  // Show Add Friend button (green)
			  const addFriendButton = createButton(
				'green',
				i18n.t('addFriend', { ns: 'profile' }) || 'Add Friend',
				async () => {
				  try {
					const response = await fetch('/api/friends/add', {
					  method: 'POST',
					  headers: {
						'Content-Type': 'application/json',
					  },
					  body: JSON.stringify({ username: username })
					});
					
					if (response.ok) {
					  // Refresh profile to update the button
					  showProfile(container, username);
					} else {
					  console.error('Failed to add friend');
					}
				  } catch (error) {
					console.error('Error adding friend:', error);
				  }
				}
			  );
			  friendButtonContainer.appendChild(addFriendButton);
			}
		  }
		}
	  })
}