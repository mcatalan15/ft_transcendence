import { navigate } from '../router';

export enum MessageType {
  GENERAL = 'general',
  PRIVATE = 'private',
  SERVER = 'server',
  SYSTEM = 'system',
  FRIEND = 'friend',
  GAME = 'game',
  GAME_INVITE = 'game_invite',
  GAME_INVITE_RESPONSE = 'game_invite_response'
}

export interface ChatMessage {
  id: string;
  type: MessageType;
  username?: string;
  content: string;
  timestamp: Date;
  channel?: string;
  targetUser?: string;
  inviteId?: string;
  gameRoomId?: string;
}

export class ChatManager {
  private socket: WebSocket | null = null;
  private messages: ChatMessage[] = [];
  private blockedUsers: string[] = [];
  private isIdentified: boolean = false;
  private chatContainer: HTMLElement | null = null;
  private messageInput: HTMLInputElement | null = null;
  private typeSelector: HTMLSelectElement | null = null;
  private activeFilter: MessageType | null = null;

  constructor() {
    this.loadBlockedUsers();
  }

  private loadBlockedUsers(): void {
    this.blockedUsers = JSON.parse(sessionStorage.getItem('blockedUsers') || '[]');
  }

  private saveBlockedUsers(): void {
    sessionStorage.setItem('blockedUsers', JSON.stringify(this.blockedUsers));
  }

  public blockUser(username: string): void {
    if (!this.blockedUsers.includes(username)) {
      this.blockedUsers.push(username);
      this.saveBlockedUsers();
      this.addSystemMessage(`Blocked user: ${username}`, MessageType.SYSTEM);
      this.filterMessages();
    }
  }

  public unblockUser(username: string): void {
    const index = this.blockedUsers.indexOf(username);
    if (index > -1) {
      this.blockedUsers.splice(index, 1);
      this.saveBlockedUsers();
      this.addSystemMessage(`Unblocked user: ${username}`, MessageType.SYSTEM);
      this.filterMessages();
    }
  }

  public isUserBlocked(username: string): boolean {
    return this.blockedUsers.includes(username);
  }

  public getBlockedUsers(): string[] {
    return [...this.blockedUsers];
  }

  public addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.displayMessage(message);
  }

  public addSystemMessage(content: string, type: MessageType = MessageType.SERVER): void {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: type,
      content: content,
      timestamp: new Date()
    };
    this.addMessage(message);
  }

  public getMessageStyle(type: MessageType): string {
    const baseStyle = 'px-3 py-2 mb-1 rounded-md border-l-4 text-sm';
    
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

  public formatMessage(message: ChatMessage): string {
    const timestamp = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentUser = sessionStorage.getItem('username') || 'Anonymous';
    
    const makeUsernameClickable = (username: string): string => {
      if (username === currentUser) {
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
              <button class="accept-invite bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs" 
                      data-invite-id="${message.inviteId}" data-from="${message.username}">
                Accept
              </button>
              <button class="decline-invite bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs" 
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

  public displayMessage(message: ChatMessage): void {
    if (!this.chatContainer) return;

    if (message.username && this.isUserBlocked(message.username)) {
      return;
    }
    
    if (this.activeFilter && message.type !== this.activeFilter) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = this.getMessageStyle(message.type);
    messageDiv.innerHTML = this.formatMessage(message);
    
    this.attachUsernameListeners(messageDiv);
    
    if (message.type === MessageType.GAME_INVITE) {
      setTimeout(() => this.attachInviteListeners(messageDiv), 50);
    }
    
    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  private attachUsernameListeners(messageDiv: HTMLElement): void {
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
  }

  private attachInviteListeners(messageDiv: HTMLElement): void {
    const acceptBtn = messageDiv.querySelector('.accept-invite') as HTMLButtonElement;
    const declineBtn = messageDiv.querySelector('.decline-invite') as HTMLButtonElement;
    
    if (acceptBtn) {
      acceptBtn.onclick = (e) => {
        e.preventDefault();
        const inviteId = acceptBtn.dataset.inviteId;
        const fromUser = acceptBtn.dataset.from;
        this.acceptGameInvite(inviteId!, fromUser!);
        acceptBtn.disabled = true;
        declineBtn.disabled = true;
        acceptBtn.textContent = 'Accepted';
        acceptBtn.className = 'bg-gray-500 text-white px-3 py-1 rounded text-xs cursor-not-allowed';
      };
    }
    
    if (declineBtn) {
      declineBtn.onclick = (e) => {
        e.preventDefault();
        const inviteId = declineBtn.dataset.inviteId;
        const fromUser = declineBtn.dataset.from;
        this.declineGameInvite(inviteId!, fromUser!);
        acceptBtn.disabled = true;
        declineBtn.disabled = true;
        declineBtn.textContent = 'Declined';
        declineBtn.className = 'bg-gray-500 text-white px-3 py-1 rounded text-xs cursor-not-allowed';
      };
    }
  }

  public sendGameInvitation(targetUser: string): void {
    const username = sessionStorage.getItem('username') || 'Anonymous';
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const inviteMessage = {
      type: MessageType.GAME_INVITE,
      username: username,
      targetUser: targetUser,
      content: `${username} wants to challenge you to a Pong match!`,
      inviteId: inviteId,
      timestamp: new Date().toISOString()
    };

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(inviteMessage));
      this.addSystemMessage(`Game invitation sent to @${targetUser}`, MessageType.GAME);
    }
  }

  public acceptGameInvite(inviteId: string, fromUser: string): void {
    const username = sessionStorage.getItem('username') || 'Anonymous';

    console.log(`Accepting game invite: inviteId=${inviteId}, fromUser=${fromUser}, username=${username}`);

    const responseMessage = {
      type: MessageType.GAME_INVITE_RESPONSE,
      username: username,
      targetUser: fromUser,
      content: `${username} accepted the game invitation!`,
      inviteId: inviteId,
      action: 'accept',
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending response message:', responseMessage);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(responseMessage));
    }
    
    this.addSystemMessage(`Joining game with ${fromUser}...`, MessageType.GAME);
    this.addSystemMessage('Waiting for server to create game session...', MessageType.GAME);
  }

  public declineGameInvite(inviteId: string, fromUser: string): void {
    const username = sessionStorage.getItem('username') || 'Anonymous';
    
    const responseMessage = {
      type: MessageType.GAME_INVITE_RESPONSE,
      username: username,
      targetUser: fromUser,
      content: `${username} declined the game invitation.`,
      inviteId: inviteId,
      action: 'decline',
      timestamp: new Date().toISOString()
    };
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(responseMessage));
    }
    this.addSystemMessage(`Declined game invitation from ${fromUser}`, MessageType.GAME);
  }

  public showUserContextMenu(event: MouseEvent, username: string): void {
    const existingMenu = document.getElementById('user-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.id = 'user-context-menu';
    menu.className = `
      absolute bg-neutral-800 border border-neutral-600 rounded-md shadow-lg 
      py-2 min-w-[150px] z-50
    `.replace(/\s+/g, ' ').trim();
    
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    
    const isBlocked = this.isUserBlocked(username);
    
    const menuItems = [
      {
        label: `Private Message`,
        action: () => {
          if (this.typeSelector && this.messageInput) {
            this.typeSelector.value = MessageType.PRIVATE;
            this.messageInput.value = `@${username} `;
            this.messageInput.focus();
          }
          this.closeContextMenu();
        }
      },
      {
        label: `Invite to Game`,
        action: () => {
          this.sendGameInvitation(username);
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
      document.addEventListener('click', this.closeContextMenu.bind(this));
      document.addEventListener('contextmenu', this.closeContextMenu.bind(this));
    }, 100);
  }

  public closeContextMenu(): void {
    const menu = document.getElementById('user-context-menu');
    if (menu) {
      menu.remove();
    }
    document.removeEventListener('click', this.closeContextMenu.bind(this));
    document.removeEventListener('contextmenu', this.closeContextMenu.bind(this));
  }

  public sendMessage(): void {
    if (!this.messageInput || !this.typeSelector) return;

    const messageText = this.messageInput.value.trim();
    
    if (!messageText) return;
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.isIdentified) {
      this.addSystemMessage('Not connected to server', MessageType.SYSTEM);
      return;
    }

    const username = sessionStorage.getItem('username') || 'Anonymous';
    
    if (this.handleCommand(messageText)) {
      this.messageInput.value = '';
      return;
    }
    
    const messageType = this.typeSelector.value as MessageType;
    
    let targetUser = null;
    let content = messageText;
    
    if (messageType === MessageType.PRIVATE) {
      const whisperMatch = messageText.match(/^@([a-zA-Z0-9-]{3,8})\s+(.+)$/);
      if (whisperMatch) {
        targetUser = whisperMatch[1];
        content = whisperMatch[2];
      } else {
        this.addSystemMessage('Private messages format: @username message', MessageType.SYSTEM);
        return;
      }
    }
    
    const message = {
      type: messageType,
      username: username,
      content: content,
      targetUser: targetUser,
      timestamp: new Date().toISOString()
    };

    this.socket.send(JSON.stringify(message));
    this.messageInput.value = '';
  }

  private handleCommand(messageText: string): boolean {
    const inviteMatch = messageText.match(/^\/invite\s+@([a-zA-Z0-9-]{3,8})(?:\s+(.*))?$/i);
    if (inviteMatch) {
      const targetUser = inviteMatch[1];
      this.sendGameInvitation(targetUser);
      return true;
    }

    const blockMatch = messageText.match(/^\/block\s+@([a-zA-Z0-9-]{3,8})(?:\s+(.*))?$/i);
    if (blockMatch) {
      const targetUser = blockMatch[1];
      this.blockUser(targetUser);
      return true;
    }

    const unblockMatch = messageText.match(/^\/unblock\s+@([a-zA-Z0-9-]{3,8})(?:\s+(.*))?$/i);
    if (unblockMatch) {
      const targetUser = unblockMatch[1];
      this.unblockUser(targetUser);
      return true;
    }
    
    if (messageText === '/blocklist') {
      if (this.blockedUsers.length === 0) {
        this.addSystemMessage('No blocked users', MessageType.SYSTEM);
      } else {
        this.addSystemMessage(`Blocked users: ${this.blockedUsers.join(', ')}`, MessageType.SYSTEM);
      }
      return true;
    }
    
    if (messageText === '/help') {
      this.addSystemMessage(`Available commands:
		/invite @username - Invite user to play Pong
		/block @username - Block a user
		/unblock @username - Unblock a user  
		/blocklist - Show blocked users
		/help - Show this help

		Tip: Right-click on usernames for quick actions!`, MessageType.SYSTEM);
      return true;
    }

    return false;
  }

  public setActiveFilter(filter: MessageType | null): void {
    this.activeFilter = filter;
    this.filterMessages();
  }

  public filterMessages(): void {
    if (!this.chatContainer) return;

    this.chatContainer.innerHTML = '';
    
    this.messages.forEach(message => {
      this.displayMessage(message);
    });
  }

  public connectWebSocket(url: string = 'ws://localhost:3100/ws'): void {
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      console.log('WebSocket connected');
      this.addSystemMessage('Connected to chat server');
      this.addSystemMessage('Type /help for available commands', MessageType.SYSTEM);

      const username = sessionStorage.getItem('username') || 'Anonymous';
      const userId = sessionStorage.getItem('userId') || Date.now().toString();
      
      this.socket!.send(JSON.stringify({
        type: 'identify',
        userId: userId,
        username: username
      }));
      
      this.isIdentified = true;
    });

    this.socket.addEventListener('message', (event) => {
      this.handleWebSocketMessage(event);
    });

    this.socket.addEventListener('close', () => {
      console.log('WebSocket closed');
      this.addSystemMessage('Disconnected from chat server', MessageType.SYSTEM);
      this.isIdentified = false;
    });

    this.socket.addEventListener('error', (e) => {
      console.error('WebSocket error', e);
      this.addSystemMessage('Connection error', MessageType.SYSTEM);
      this.isIdentified = false;
    });
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      console.log('Received WebSocket message:', data);
      
      if (data.type === 'game_invite_accepted') {
        console.log('Processing game_invite_accepted:', data);
        this.addSystemMessage(`${data.username} accepted your game invitation! Creating game session...`, MessageType.GAME);
        
        if (data.gameId) {
          console.log('Redirecting to pong with gameId:', data.gameId);
          setTimeout(() => {
            navigate(`/pong?gameId=${data.gameId}&mode=online&opponent=${data.username}`);
          }, 1000);
        } else {
          console.error('No gameId received in game_invite_accepted:', data);
          this.addSystemMessage('Error: No game ID received from server', MessageType.SYSTEM);
        }
        return;
      }
      
      if (data.type === 'game_session_created') {
        console.log('Processing game_session_created:', data);
        this.addSystemMessage(`Game session created! Joining...`, MessageType.GAME);
        if (data.gameId) {
          console.log('Redirecting to pong with gameId:', data.gameId);
          setTimeout(() => {
            navigate(`/pong?gameId=${data.gameId}&mode=online&opponent=${data.fromUser}`);
          }, 1000);
        } else {
          console.error('No gameId received in game_session_created:', data);
          this.addSystemMessage('Error: No game ID received from server', MessageType.SYSTEM);
        }
        return;
      }
      
      if (data.type === 'game_invite_declined') {
        this.addSystemMessage(`${data.username} declined your game invitation.`, MessageType.GAME);
        return;
      }
      
      const message: ChatMessage = {
        id: data.id || Date.now().toString(),
        type: data.type as MessageType,
        username: data.username,
        content: data.content,
        timestamp: new Date(data.timestamp),
        channel: data.channel,
        targetUser: data.targetUser,
        inviteId: data.inviteId,
        gameRoomId: data.gameRoomId
      };
      
      if (message.type === MessageType.GAME_INVITE) {
        const currentUser = sessionStorage.getItem('username');
        if (message.targetUser !== currentUser) {
          return;
        }
      }
        
      this.addMessage(message);
    } catch (e) {
      console.error('Error parsing message:', e, 'Raw data:', event.data);
    }
  }

  public initialize(chatContainer: HTMLElement, messageInput: HTMLInputElement, typeSelector: HTMLSelectElement): void {
    this.chatContainer = chatContainer;
    this.messageInput = messageInput;
    this.typeSelector = typeSelector;

    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    this.typeSelector.addEventListener('change', () => {
      const selectedType = this.typeSelector!.value as MessageType;
      if (selectedType === MessageType.PRIVATE) {
        this.messageInput!.placeholder = 'Private message: @username your message...';
      } else {
        this.messageInput!.placeholder = 'Type your message...';
      }
    });

    this.connectWebSocket();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isIdentified = false;
  }
}