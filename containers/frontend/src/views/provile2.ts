// Add this function at the top of your profile.ts file, after the imports
async function fetchUserStats(username?: string): Promise<any> {
    try {
        const statsEndpoint = username ? `/api/stats/${username}` : '/api/stats';
        const response = await fetch(statsEndpoint, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Stats API returned ${response.status}, using default values`);
            return {
                matchesPlayed: 0,
                tournamentsPlayed: 0,
                victories: 0,
                losses: 0,
                winRate: 0.0,
                draws: 0
            };
        }

        const data = await response.json();
        
        // Ensure all values exist and default to 0 if missing
        return {
            matchesPlayed: data.total_games || 0,
            tournamentsPlayed: data.tournaments_won || 0, // You might need to adjust this based on your DB schema
            victories: data.wins || 0,
            losses: data.losses || 0,
            winRate: data.win_rate || 0.0,
            draws: data.draws || 0
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        // Return default values on error
        return {
            matchesPlayed: 0,
            tournamentsPlayed: 0,
            victories: 0,
            losses: 0,
            winRate: 0.0,
            draws: 0
        };
    }
}

// Update your existing stat elements creation to include losses
const stat1 = document.createElement('div');
stat1.className = 'text-lg md:text-xl text-amber-50 mb-1 md:mb-2 flex items-center gap-2 md:gap-3';
stat1.innerHTML = `<span class="font-bold text-3xl md:text-4xl" id="matchesPlayed">0</span> <span>${i18n.t('matchesPlayed', { ns: 'profile' }) || 'Partidas jugadas'}</span>`;

const stat2 = document.createElement('div');
stat2.className = 'text-lg md:text-xl text-amber-50 mb-1 md:mb-2 flex items-center gap-2 md:gap-3';
stat2.innerHTML = `<span class="font-bold text-3xl md:text-4xl" id="tournamentsPlayed">0</span> <span>${i18n.t('tournamentsPlayed', { ns: 'profile' }) || 'Torneos jugados'}</span>`;

const stat3 = document.createElement('div');
stat3.className = 'text-lg md:text-xl text-amber-50 mb-1 md:mb-2 flex items-center gap-2 md:gap-3';
stat3.innerHTML = `<span class="font-bold text-3xl md:text-4xl" id="victories">0</span> <span>${i18n.t('victories', { ns: 'profile' }) || 'Victorias'}</span>`;

// Add a new stat for losses
const stat4 = document.createElement('div');
stat4.className = 'text-lg md:text-xl text-amber-50 mb-1 md:mb-2 flex items-center gap-2 md:gap-3';
stat4.innerHTML = `<span class="font-bold text-3xl md:text-4xl" id="losses">0</span> <span>${i18n.t('losses', { ns: 'profile' }) || 'Derrotas'}</span>`;

middleCol.appendChild(stat1);
middleCol.appendChild(stat2);
middleCol.appendChild(stat3);
middleCol.appendChild(stat4); // Add the new losses stat

// Then replace your existing .then() block with this updated version:
.then(async data => {
    if (!data) return;

    const username = data.username;
    if (isOwnProfile) {
      profileTitle.textContent = i18n.t('profileTitleOwn', { ns: 'profile', username }) || `${username}'s profile`;
    } else {
      profileTitle.textContent = i18n.t('profileTitle', { ns: 'profile', username }) || `${username}'s profile`;
    }
  
    nicknameSpan.textContent = username;
    avatar.src = `/api/profile/avatar/${data.userId}?t=${Date.now()}`;
    
    if (!isOwnProfile) {
        updateOnlineStatus(data.userId);
        
        // Optional: Set up periodic status updates
        const statusInterval = setInterval(() => {
            updateOnlineStatus(data.userId);
        }, 30000); // Update every 30 seconds
        
        // Clean up interval when navigating away
        (window as any).profileStatusInterval = statusInterval;
    } else {
        // Hide status indicator for own profile
        const statusIndicator = document.getElementById('online-status-indicator');
        if (statusIndicator) {
            statusIndicator.style.display = 'none';
        }
    }

    // Fetch and update user statistics
    try {
        const stats = await fetchUserStats(isOwnProfile ? undefined : username);
        
        // Update stat displays with fetched data
        const matchesElement = document.getElementById('matchesPlayed');
        const tournamentsElement = document.getElementById('tournamentsPlayed');
        const victoriesElement = document.getElementById('victories');
        const lossesElement = document.getElementById('losses');
        
        if (matchesElement) matchesElement.textContent = stats.matchesPlayed.toString();
        if (tournamentsElement) tournamentsElement.textContent = stats.tournamentsPlayed.toString();
        if (victoriesElement) victoriesElement.textContent = stats.victories.toString();
        if (lossesElement) lossesElement.textContent = stats.losses.toString();
        
    } catch (statsError) {
        console.error('Error loading user stats:', statsError);
        // Stats will remain at default "0" values
    }

    // Handle friend button logic (existing code)
    if (!isOwnProfile) {
        console.log(data.isFriend);
        const friendButtonContainer = document.getElementById('friendButtonContainer');
        if (friendButtonContainer) {
          friendButtonContainer.innerHTML = '';
          
          if (data.isFriend) {
            const removeFriendButton = createButton(
              'red',
              i18n.t('removeFriend', { ns: 'profile' }) || 'Remove Friend',
              async () => {
                const success = await removeFriend(username);
                if (success) {
                  showProfile(container, username);
                }
              }
            );
            friendButtonContainer.appendChild(removeFriendButton);
          } else {
            const addFriendButton = createButton(
              'lime',
              i18n.t('addFriend', { ns: 'profile' }) || 'Add Friend',
              async () => {
                const success = await addFriend(username);
                if (success) {
                  showProfile(container, username);
                }
              }
            );
            friendButtonContainer.appendChild(addFriendButton);
        }
      }
    }
  });