import { MessageType } from '../../types/chat.types';

export class UserInteractions {
  private blockedUsers: string[] = [];
  private addSystemMessage: (content: string, type: MessageType) => void;
  private filterMessages: () => void;

  constructor(addSystemMessage: (content: string, type: MessageType) => void, filterMessages: () => void) {
    this.blockedUsers = JSON.parse(sessionStorage.getItem('blockedUsers') || '[]');
    this.addSystemMessage = addSystemMessage;
    this.filterMessages = filterMessages;
  }

  private saveBlockedUsers() {
    sessionStorage.setItem('blockedUsers', JSON.stringify(this.blockedUsers));
  }

  blockUser(username: string) {
    if (!this.blockedUsers.includes(username)) {
      this.blockedUsers.push(username);
      this.saveBlockedUsers();
      this.addSystemMessage(`Blocked user: ${username}`, MessageType.SYSTEM);
      this.filterMessages();
    }
  }

  unblockUser(username: string) {
    const index = this.blockedUsers.indexOf(username);
    if (index > -1) {
      this.blockedUsers.splice(index, 1);
      this.saveBlockedUsers();
      this.addSystemMessage(`Unblocked user: ${username}`, MessageType.SYSTEM);
      this.filterMessages();
    }
  }

  isUserBlocked(username: string): boolean {
    return this.blockedUsers.includes(username);
  }

  getBlockedUsers(): string[] {
    return [...this.blockedUsers];
  }

  showUserContextMenu(event: MouseEvent, username: string, onPrivateMessage: (username: string) => void, onGameInvite: (username: string) => void) {
    const existingMenu = document.getElementById('user-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.id = 'user-context-menu';
    menu.className = `
      absolute bg-neutral-800 border border-neutral-600 shadow-lg 
      py-2 min-w-[150px] z-50
    `.replace(/\s+/g, ' ').trim();
    
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    
    const isBlocked = this.isUserBlocked(username);
    
    const menuItems = [
      {
        label: `Private Message`,
        action: () => {
          onPrivateMessage(username);
          this.closeContextMenu();
        }
      },
      {
        label: `Invite to Game`,
        action: () => {
          onGameInvite(username);
          this.closeContextMenu();
        }
      },
      {
        label: isBlocked ? `Unblock ${username}` : `Block ${username}`,
        action: () => {
          if (isBlocked) {
            this.unblockUser(username);
          } else {
            this.blockUser(username);
          }
          this.closeContextMenu();
        },
        className: isBlocked ? 'text-green-400 hover:bg-green-900' : 'text-red-400 hover:bg-red-900'
      }
    ];
    
    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = `
        px-4 py-2 cursor-pointer hover:bg-neutral-700 text-sm
        ${item.className || 'text-neutral-200 hover:bg-neutral-700'}
      `.replace(/\s+/g, ' ').trim();
      menuItem.textContent = item.label;
      menuItem.onclick = item.action;
      menu.appendChild(menuItem);
    });
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
      document.addEventListener('click', () => this.closeContextMenu());
      document.addEventListener('contextmenu', () => this.closeContextMenu());
    }, 100);
  }

  private closeContextMenu() {
    const menu = document.getElementById('user-context-menu');
    if (menu) {
      menu.remove();
    }
    document.removeEventListener('click', () => this.closeContextMenu());
    document.removeEventListener('contextmenu', () => this.closeContextMenu());
  }
}