import { ChatMessage, MessageType } from '../../types/chat.types';
import { navigate } from '../../utils/router';

export class MessageRenderer {
  private currentUser: string;
  private isUserBlocked: (username: string) => boolean;
  private showUserContextMenu: (event: MouseEvent, username: string) => void;

  constructor(currentUser: string, isUserBlocked: (username: string) => boolean, showUserContextMenu: (event: MouseEvent, username: string) => void) {
    this.currentUser = currentUser;
    this.isUserBlocked = isUserBlocked;
    this.showUserContextMenu = showUserContextMenu;
  }

  getMessageStyle(type: MessageType): string {
    const baseStyle = 'px-3 py-2 mb-1 border-l-4 text-sm';
    
    switch (type) {
      case MessageType.GENERAL:
        return `${baseStyle} bg-neutral-800 border-cyan-400 text-cyan-100`;
      case MessageType.PRIVATE:
        return `${baseStyle} bg-pink-950/30 border-pink-400 text-pink-100`;
      case MessageType.SERVER:
        return `${baseStyle} bg-amber-950/30 border-amber-400 text-amber-100`;
      case MessageType.SYSTEM:
        return `${baseStyle} bg-red-950/30 border-red-400 text-red-100`;
      case MessageType.FRIEND:
        return `${baseStyle} bg-lime-950/30 border-lime-400 text-lime-100`;
      case MessageType.GAME:
        return `${baseStyle} bg-blue-950/30 border-blue-400 text-blue-100`;
      case MessageType.GAME_INVITE:
        return `${baseStyle} bg-purple-950/30 border-purple-400 text-purple-100`;
      case MessageType.GAME_INVITE_RESPONSE:
        return `${baseStyle} bg-green-950/30 border-green-400 text-green-100`;
      default:
        return `${baseStyle} bg-neutral-800 border-neutral-400 text-neutral-100`;
    }
  }

  formatMessage(message: ChatMessage): string {
    const timestamp = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const makeUsernameClickable = (username: string): string => {
      if (username === this.currentUser) {
        return username;
      }
      return `<span class="username-clickable cursor-pointer hover:underline text-white font-semibold" 
                    data-username="${username}" 
                    title="Left-click for profile, Right-click for options">
                ${username}
              </span>`;
    };
    
    switch (message.type) {
      case MessageType.PRIVATE:
        return `<span class="text-pink-300">[${timestamp}] [WHISPER] ${makeUsernameClickable(message.username || 'Unknown')}:</span> ${message.content}`;
      case MessageType.SERVER:
        return `<span class="text-amber-300">[${timestamp}] [SERVER]</span> ${message.content}`;
      case MessageType.SYSTEM:
        return `<span class="text-red-300">[${timestamp}] [SYSTEM]</span> ${message.content}`;
      case MessageType.FRIEND:
        return `<span class="text-lime-300">[${timestamp}] [FRIEND] ${makeUsernameClickable(message.username || 'Unknown')}:</span> ${message.content}`;
      case MessageType.GAME:
        return `<span class="text-blue-300">[${timestamp}] [GAME]</span> ${message.content}`;
      case MessageType.GAME_INVITE:
        return `
          <div class="flex items-center justify-between">
            <span class="text-purple-300">[${timestamp}] [GAME INVITE] ${makeUsernameClickable(message.username || 'Unknown')}:</span>
            <div class="flex gap-2 ml-4">
              <button class="accept-invite bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs" 
                      data-invite-id="${message.inviteId}" data-from="${message.username}">
                Accept
              </button>
              <button class="decline-invite bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs" 
                      data-invite-id="${message.inviteId}" data-from="${message.username}">
                Decline
              </button>
            </div>
          </div>
          <div class="mt-1">${message.content}</div>
        `;
      case MessageType.GAME_INVITE_RESPONSE:
        return `<span class="text-green-300">[${timestamp}] [GAME]</span> ${message.content}`;
      case MessageType.GENERAL:
      default:
        return `<span class="text-cyan-300">[${timestamp}] ${makeUsernameClickable(message.username || 'Unknown')}:</span> ${message.content}`;
    }
  }

  createMessageElement(message: ChatMessage, onAcceptInvite: (inviteId: string, fromUser: string) => void, onDeclineInvite: (inviteId: string, fromUser: string) => void): HTMLElement {
    if (message.username && this.isUserBlocked(message.username)) {
      return document.createElement('div'); // Return empty div for blocked users
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = this.getMessageStyle(message.type);
    messageDiv.innerHTML = this.formatMessage(message);
    
    // Add event listeners for usernames
    const clickableUsernames = messageDiv.querySelectorAll('.username-clickable');
    clickableUsernames.forEach(usernameElement => {
      const username = usernameElement.getAttribute('data-username');
      if (username) {
        usernameElement.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.showUserContextMenu(e as MouseEvent, username);
        });
        
        usernameElement.addEventListener('click', (e) => {
          e.preventDefault();
          navigate(`/profile/${username}`);
        });
      }
    });
    
    // Add event listeners for invite buttons
    if (message.type === MessageType.GAME_INVITE) {
      setTimeout(() => {
        const acceptBtn = messageDiv.querySelector('.accept-invite') as HTMLButtonElement;
        const declineBtn = messageDiv.querySelector('.decline-invite') as HTMLButtonElement;
        
        if (acceptBtn) {
          acceptBtn.onclick = (e) => {
            e.preventDefault();
            const inviteId = acceptBtn.dataset.inviteId!;
            const fromUser = acceptBtn.dataset.from!;
            onAcceptInvite(inviteId, fromUser);
            this.disableInviteButtons(acceptBtn, declineBtn, 'Accepted');
          };
        }
        
        if (declineBtn) {
          declineBtn.onclick = (e) => {
            e.preventDefault();
            const inviteId = declineBtn.dataset.inviteId!;
            const fromUser = declineBtn.dataset.from!;
            onDeclineInvite(inviteId, fromUser);
            this.disableInviteButtons(acceptBtn, declineBtn, 'Declined');
          };
        }
      }, 50);
    }
    
    return messageDiv;
  }

  private disableInviteButtons(acceptBtn: HTMLButtonElement, declineBtn: HTMLButtonElement, status: string) {
    acceptBtn.disabled = true;
    declineBtn.disabled = true;
    acceptBtn.textContent = status;
    acceptBtn.className = 'bg-gray-500 text-white px-3 py-1 rounded text-xs cursor-not-allowed';
  }
}