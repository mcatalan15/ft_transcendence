import { navigate } from '../../utils/router';
import i18n from '../../i18n';

interface Friend {
  id_user: string;
  username: string;
}

export class FriendsContentRenderer {
  private container: HTMLElement;
  private friendsData: Friend[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(): HTMLElement {
    const mainContent = document.createElement('div');
    mainContent.className = 'flex flex-col items-center w-full';
    mainContent.style.backgroundColor = '#171717';

    const searchSection = this.createSearchSection();
    mainContent.appendChild(searchSection);

    const friendsSection = this.createFriendsSection();
    mainContent.appendChild(friendsSection);

    this.loadAndRenderFriends();
    return mainContent;
  }

  private createFriendsSection(): HTMLElement {
    const friendsContainer = document.createElement('div');
    friendsContainer.className = 'w-full flex flex-col items-center mt-8 px-4';

    const overlay = this.createFriendsOverlay();
    const friendsListSection = this.createFriendsListSection();
    overlay.appendChild(friendsListSection);

    friendsContainer.appendChild(overlay);
    return friendsContainer;
  }

  private createFriendsOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'relative p-6 gap-6 flex flex-col items-center';
    
    overlay.style.backgroundColor = '#171717';
    overlay.style.borderRadius = '0px';
    overlay.style.width = '100%';
    overlay.style.maxWidth = '1000px';

    return overlay;
  }

  private createSearchSection(): HTMLElement {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'w-full flex justify-end mb-6 mt-4 pr-8';

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'relative w-full max-w-md';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'friends-search-input';
    searchInput.placeholder = i18n.t('searchPlaceholder', { ns: 'friends' }) || 'Search friends...';
    searchInput.className = 'w-full';
    
    searchInput.style.backgroundColor = 'transparent';
    searchInput.style.border = '2px solid #FFFBEB';
    searchInput.style.color = '#FFFBEB';
    searchInput.style.fontFamily = '"Roboto Mono", monospace';
    searchInput.style.fontWeight = 'normal';
    searchInput.style.fontSize = '14px';
    searchInput.style.padding = '12px 16px';
    searchInput.style.borderRadius = '0px';
    searchInput.style.outline = 'none';

    const style = document.createElement('style');
    style.textContent = `
      #friends-search-input::placeholder {
        color: rgba(255, 251, 235, 0.6);
        font-family: "Roboto Mono", monospace;
      }
      #friends-search-input:focus {
        border-color: #FFFBEB;
        box-shadow: none;
      }
    `;
    document.head.appendChild(style);

    searchInput.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterFriends(value);
    });

    searchWrapper.appendChild(searchInput);
    searchContainer.appendChild(searchWrapper);

    return searchContainer;
  }

  private createFriendsListSection(): HTMLElement {
    const listContainer = document.createElement('div');
    listContainer.className = 'w-full flex flex-col items-center';

    const friendsList = document.createElement('div');
    friendsList.id = 'friends-list';
    friendsList.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full justify-items-center pt-2';

    listContainer.appendChild(friendsList);
    return listContainer;
  }

  private async loadAndRenderFriends(): Promise<void> {
    try {
      const response = await fetch('/api/friends', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      
      if (data.success) {
        this.friendsData = data.friends;
        this.renderFriends(this.friendsData);
      } else {
        this.showError('Error loading friends list');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      this.showError('Error loading friends list');
    }
  }

  private renderFriends(friends: Friend[]): void {
    const friendsList = document.getElementById('friends-list');
    if (!friendsList) return;

    friendsList.innerHTML = '';

    if (friends.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No friends found';
      emptyMessage.className = 'col-span-full text-center py-8';
      emptyMessage.style.color = '#FFFBEB';
      emptyMessage.style.fontFamily = '"Roboto Mono", monospace';
      emptyMessage.style.fontSize = '14px';
      emptyMessage.style.opacity = '0.7';
      friendsList.appendChild(emptyMessage);
      return;
    }

    friends.forEach((friend) => {
      const friendCard = this.createFriendCard(friend);
      friendsList.appendChild(friendCard);
    });
  }

  private createFriendCard(friend: Friend): HTMLElement {
    const friendDiv = document.createElement('div');
    friendDiv.className = 'flex flex-col items-center w-full max-w-[100px] md:max-w-[120px] mx-auto cursor-pointer';
    
    friendDiv.style.padding = '12px';
    friendDiv.style.border = '2px solid transparent';
    friendDiv.style.borderRadius = '0px';
    friendDiv.style.transition = 'all 0.3s ease';

    friendDiv.addEventListener('mouseenter', () => {
      friendDiv.style.border = '2px solid #FFFBEB';
      friendDiv.style.backgroundColor = 'rgba(255, 251, 235, 0.1)';
    });

    friendDiv.addEventListener('mouseleave', () => {
      friendDiv.style.border = '2px solid transparent';
      friendDiv.style.backgroundColor = 'transparent';
    });

    friendDiv.addEventListener('click', () => {
      navigate(`/profile/${friend.username}`);
    });

    const friendAvatar = document.createElement('img');
    friendAvatar.src = `/api/profile/avatar/${friend.id_user}?t=${Date.now()}`;
    friendAvatar.alt = friend.username;
    friendAvatar.className = 'w-16 h-16 md:w-24 md:h-24 object-cover shadow transition duration-200 hover:scale-105';
    friendAvatar.style.border = '3px solid #FFFBEB';
    friendAvatar.style.borderRadius = '0px';

    const friendName = document.createElement('span');
    friendName.className = 'mt-2 text-center truncate max-w-[80px]';
    friendName.textContent = friend.username;
    friendName.style.color = '#FFFBEB';
    friendName.style.fontFamily = '"Roboto Mono", monospace';
    friendName.style.fontWeight = 'bold';
    friendName.style.fontSize = '12px';
    friendName.style.textTransform = 'uppercase';

    friendDiv.appendChild(friendAvatar);
    friendDiv.appendChild(friendName);

    return friendDiv;
  }

  private filterFriends(searchValue: string): void {
    const filteredFriends = this.friendsData.filter(friend =>
      friend.username.toLowerCase().includes(searchValue)
    );
    this.renderFriends(filteredFriends);
  }

  private showError(message: string): void {
    const friendsList = document.getElementById('friends-list');
    if (!friendsList) return;

    friendsList.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.className = 'col-span-full text-center py-8';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontFamily = '"Roboto Mono", monospace';
    errorDiv.style.fontSize = '14px';
    friendsList.appendChild(errorDiv);
  }
}