import { navigate } from '../../utils/router';
import i18n from '../../i18n';
import { getApiUrl } from '../../config/api';
import { Pagination } from '../generalComponents/Pagination';

interface Friend {
  id_user: string;
  username: string;
}

export class FriendsContentRenderer {
  private friendsData: Friend[] = [];
  private currentPage: number = 0;
  private friendsPerPage: number = 10;
  private totalPages: number = 1;
  private paginationComponent: Pagination | null = null;
  private filteredFriends: Friend[] = [];

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
    const paginationSection = this.createPaginationSection();
    overlay.appendChild(friendsListSection);
    overlay.appendChild(paginationSection);

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

  private createPaginationSection(): HTMLElement {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'w-full flex justify-center mt-4';
    paginationContainer.id = 'pagination-container';

    return paginationContainer;
  }

  private createSearchSection(): HTMLElement {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'w-full flex justify-end mb-2 mt-16 pr-36';

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
    searchInput.style.fontSize = '12px';
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
      const response = await fetch(getApiUrl('/friends'), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      
      if (data.success) {
        this.friendsData = data.friends;
        this.filteredFriends = [...this.friendsData];
        this.totalPages = Math.max(1, Math.ceil(this.filteredFriends.length / this.friendsPerPage));

        if (this.currentPage >= this.totalPages) {
          this.currentPage = Math.max(0, this.totalPages - 1);
        }

        this.renderFriendsPage();
        this.updatePagination();
      } else {
        this.showError('Error loading friends list');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      this.showError('Error loading friends list');
    }
  }
  
  private updatePagination(): void {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) {
      return;
    }
    paginationContainer.innerHTML = '';
    
    if (this.totalPages <= 1) {
      return;
    }
    
    if (!this.paginationComponent) {
      this.paginationComponent = new Pagination({
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        onPageChange: (page) => {
          this.currentPage = page;
          this.renderFriendsPage();
        }
      });
    } else {
      this.paginationComponent.update(this.currentPage, this.totalPages);
    }
    
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(this.paginationComponent.getElement());
  }

  private renderFriendsPage(): void {
    const startIndex = this.currentPage * this.friendsPerPage;
    const endIndex = Math.min(startIndex + this.friendsPerPage, this.filteredFriends.length);
    
    const friendsToDisplay = this.filteredFriends.slice(startIndex, endIndex);
    
    this.renderFriends(friendsToDisplay);
    
    if (this.paginationComponent) {
      this.paginationComponent.update(this.currentPage, this.totalPages);
      
      const paginationContainer = document.getElementById('pagination-container');
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
        paginationContainer.appendChild(this.paginationComponent.getElement());
      }
    }
  }

  private renderFriends(friends: Friend[]): void {
    const friendsList = document.getElementById('friends-list');
    if (!friendsList) return;

    friendsList.innerHTML = '';

    if (friends.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'col-span-full text-center py-8';
      emptyMessage.style.color = '#FFFBEB';
      emptyMessage.style.fontFamily = '"Roboto Mono", monospace';
      emptyMessage.style.fontSize = '14px';
      emptyMessage.style.opacity = '0.7';
      
      const fullText = i18n.t('noFriends', { ns: 'friends' }) || 'No friends found. Try using Chat to connect with others!';
      
      const chatRegex = /\b(chat|xat)\b/i;
      const match = fullText.match(chatRegex);
      
      if (match) {
        const indexBefore = match.index || 0;
        const matchedWord = match[0];
        const indexAfter = indexBefore + matchedWord.length;
        
        if (indexBefore > 0) {
          const beforeText = fullText.substring(0, indexBefore);
          emptyMessage.appendChild(document.createTextNode(beforeText));
        }
        
        const chatLink = document.createElement('a');
        chatLink.textContent = matchedWord;
        chatLink.href = '#';
        chatLink.className = 'text-amber-400 hover:underline cursor-pointer';
        chatLink.style.color = '#fbbf24';
        chatLink.onclick = (e: MouseEvent) => {
          e.preventDefault();
          navigate('/chat');
        };
        emptyMessage.appendChild(chatLink);
        
        if (indexAfter < fullText.length) {
          const afterText = fullText.substring(indexAfter);
          emptyMessage.appendChild(document.createTextNode(afterText));
        }
      } else {
        emptyMessage.textContent = fullText;
      }
      
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
    friendAvatar.src = `${getApiUrl('/profile/avatar')}/${friend.id_user}?t=${Date.now()}`;
    friendAvatar.alt = friend.username;
    friendAvatar.className = 'w-16 h-16 md:w-24 md:h-24 object-cover shadow transition duration-200 hover:scale-105';
    friendAvatar.style.border = '3px solid #FFFBEB';
    friendAvatar.style.borderRadius = '0px';
    friendAvatar.style.padding = '3px';

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

  public filterFriends(searchValue: string): void {
    this.filteredFriends = this.friendsData.filter(friend =>
      friend.username.toLowerCase().includes(searchValue.toLowerCase())
    );
 
    this.currentPage = 0;
    this.totalPages = Math.max(1, Math.ceil(this.filteredFriends.length / this.friendsPerPage));
    this.renderFriendsPage();
    this.updatePagination();
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