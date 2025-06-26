import i18n from '../i18n';
//import { Header } from '../components/header';
import { HeaderTest } from '../components/testmenu'
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';

// Message types for different chat categories
enum MessageType {
  GENERAL = 'general',
  PRIVATE = 'private',
  SERVER = 'server',
  SYSTEM = 'system',
  FRIEND = 'friend',
  GAME = 'game',
  GAME_INVITE = 'game_invite',
  GAME_INVITE_RESPONSE = 'game_invite_response'
}

interface ChatMessage {
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

function createButton(color: string, text: string, action: () => void) {
  let btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `
    bg-${color}-950 text-${color}-400 border border-${color}-400 border-b-4
    font-medium overflow-hidden relative px-4 py-2 rounded-md
    hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75
    outline-none duration-300 group text-sm
  `.replace(/\s+/g, ' ').trim();

  btn.innerHTML = `
    <span class="bg-${color}-400 shadow-${color}-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
    ${text}
  `;
  btn.onclick = action;
  return btn;
}

function getMessageStyle(type: MessageType): string {
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

function formatMessage(message: ChatMessage): string {
  const timestamp = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentUser = sessionStorage.getItem('username') || 'Anonymous';
  
  // Helper function to make usernames clickable (except your own)
  function makeUsernameClickable(username: string): string {
    if (username === currentUser) {
      return username; // Don't make your own username clickable
    }
    return `<span class="username-clickable cursor-pointer hover:underline text-white font-semibold" 
                  data-username="${username}" 
                  title="Left-click for profile, Right-click for options">
              ${username}
            </span>`;
  }
  
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

export function showChat(container: HTMLElement): void {
  container.innerHTML = '';
  container.className = 'grid grid-rows-[auto_1fr] h-screen overflow-hidden';

  // Add CSS for blocked user indication
  function addBlockedUserStyles() {
    // Check if styles already exist
    if (document.getElementById('blocked-user-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'blocked-user-styles';
    style.textContent = `
      .blocked-user-message {
        opacity: 0.3;
        filter: grayscale(80%);
      }
      .blocked-user-indicator::after {
        content: " (blocked)";
        color: #ef4444;
        font-size: 0.75rem;
        font-weight: normal;
      }
      #user-context-menu {
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  addBlockedUserStyles();

  // Header
  const headerWrapper = new HeaderTest().getElement();
  headerWrapper.classList.add(
  );
  container.appendChild(headerWrapper);

  //TODO: implement second language selector button at the bottom?
  // const langSelector = new LanguageSelector(() => showChat(container)).getElement();
  // langSelector.classList.add('fixed', 'top-4', 'right-4', 'z-40');
  // container.appendChild(langSelector);

  // Main content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = `
    row-start-2 flex items-center justify-center w-full h-full
    bg-neutral-900
  `.replace(/\s+/g, ' ').trim();

  // Main chat container (reusing profile design pattern)
  const chatBox = document.createElement('div');
  chatBox.className = `
    w-full max-w-[1400px] h-[750px]
    mx-auto bg-neutral-900 border-4 border-amber-50
    flex flex-col overflow-hidden shadow-xl
    p-6
  `.replace(/\s+/g, ' ').trim();

  // Chat title
  const chatTitle = document.createElement('div');
  chatTitle.className = `
    text-amber-50 text-2xl font-bold tracking-wide text-center mb-4
    border-b border-amber-50/20 pb-2
  `.replace(/\s+/g, ' ').trim();
  chatTitle.textContent = 'Pong Chat';

  // Channel tabs/filters
  const channelTabs = document.createElement('div');
  channelTabs.className = 'flex gap-2 mb-4 flex-wrap';
  
  const channels = [
    { type: MessageType.GENERAL, label: 'General', color: 'cyan' },
    { type: MessageType.PRIVATE, label: 'Whispers', color: 'pink' },
    { type: MessageType.FRIEND, label: 'Friends', color: 'lime' },
    { type: MessageType.GAME, label: 'Game', color: 'blue' },
    { type: MessageType.SERVER, label: 'Server', color: 'amber' },
  ];

  let activeFilter: MessageType | null = null;

  // Chat messages area
  const chatContainer = document.createElement('div');
  chatContainer.className = `
    flex-1 bg-neutral-800 border border-neutral-600 rounded-md
    overflow-y-auto p-4 mb-4 min-h-0
  `.replace(/\s+/g, ' ').trim();
  chatContainer.id = 'chat-messages';

  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'flex gap-3 items-center';

  // Message type selector
  const typeSelector = document.createElement('select');
  typeSelector.className = `
    bg-neutral-800 text-amber-50 border border-amber-50/30 rounded-md
    px-3 py-2 text-sm min-w-[100px]
  `.replace(/\s+/g, ' ').trim();
  typeSelector.innerHTML = `
    <option value="${MessageType.GENERAL}">General</option>
    <option value="${MessageType.PRIVATE}">Whisper</option>
    <option value="${MessageType.FRIEND}">Friend</option>
  `;

  // Message input
  const messageInput = document.createElement('input');
  messageInput.type = 'text';
  messageInput.placeholder = 'Type your message...';
  messageInput.className = `
    flex-1 bg-neutral-800 text-amber-50 border border-amber-50/30 rounded-md
    px-4 py-2 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
  `.replace(/\s+/g, ' ').trim();
  messageInput.id = 'message-input';

  // WebSocket connection
  const socket = new WebSocket('ws://localhost:3100/ws');
  const messages: ChatMessage[] = [];
  let isIdentified = false;

  // Add blocked users management
  let blockedUsers: string[] = JSON.parse(sessionStorage.getItem('blockedUsers') || '[]');
  
  function saveBlockedUsers() {
    sessionStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
  }
  
  function blockUser(username: string) {
    if (!blockedUsers.includes(username)) {
      blockedUsers.push(username);
      saveBlockedUsers();
      addSystemMessage(`Blocked user: ${username}`, MessageType.SYSTEM);
      filterMessages(); // Refresh chat to hide blocked user messages
    }
  }
  
  function unblockUser(username: string) {
    const index = blockedUsers.indexOf(username);
    if (index > -1) {
      blockedUsers.splice(index, 1);
      saveBlockedUsers();
      addSystemMessage(`Unblocked user: ${username}`, MessageType.SYSTEM);
      filterMessages(); // Refresh chat to show unblocked user messages
    }
  }
  
  function isUserBlocked(username: string): boolean {
    return blockedUsers.includes(username);
  }

  // DECLARE ALL FUNCTIONS FIRST BEFORE USING THEM
  function addMessage(message: ChatMessage) {
    messages.push(message);
    displayMessage(message);
  }

  function addSystemMessage(content: string, type: MessageType = MessageType.SERVER) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: type,
      content: content,
      timestamp: new Date()
    };
    addMessage(message);
  }

function displayMessage(message: ChatMessage) {
  // Filter out blocked users
  if (message.username && isUserBlocked(message.username)) {
    return; // Don't display messages from blocked users
  }
  
  // Apply filter check
  if (activeFilter && message.type !== activeFilter) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = getMessageStyle(message.type);
  messageDiv.innerHTML = formatMessage(message);
  
  // Add right-click context menu for usernames
  const clickableUsernames = messageDiv.querySelectorAll('.username-clickable');
  clickableUsernames.forEach(usernameElement => {
    const username = usernameElement.getAttribute('data-username');
    if (username) {
      // Right-click context menu
      usernameElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showUserContextMenu(e as MouseEvent, username);
      });
      
      // Left-click for profile navigation
      usernameElement.addEventListener('click', (e) => {
        e.preventDefault();
        // Navigate to user profile
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
          const inviteId = acceptBtn.dataset.inviteId;
          const fromUser = acceptBtn.dataset.from;
          acceptGameInvite(inviteId!, fromUser!);
          // Disable buttons after response
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
          declineGameInvite(inviteId!, fromUser!);
          // Disable buttons after response
          acceptBtn.disabled = true;
          declineBtn.disabled = true;
          declineBtn.textContent = 'Declined';
          declineBtn.className = 'bg-gray-500 text-white px-3 py-1 rounded text-xs cursor-not-allowed';
        };
      }
    }, 50);
  }
  
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function acceptGameInvite(inviteId: string, fromUser: string) {
  const username = sessionStorage.getItem('username') || 'Anonymous';
  
  // Send acceptance response
  const responseMessage = {
    type: MessageType.GAME_INVITE_RESPONSE,
    username: username,
    targetUser: fromUser,
    content: `${username} accepted the game invitation!`,
    inviteId: inviteId,
    action: 'accept',
    timestamp: new Date().toISOString()
  };
  
  socket.send(JSON.stringify(responseMessage));
  
  addSystemMessage(`Joining game with ${fromUser}...`, MessageType.GAME);
  
  setTimeout(() => {
    // Option 1: Direct navigation (if you have a direct game route)
    // navigate(`/pong?opponent=${fromUser}&invite=${inviteId}`);
    
    // Option 2: Use your existing PongNetworkManager
    startPongGameFromInvite(fromUser, inviteId);
  }, 1000);
}

function filterMessages() {
  // Clear current messages display
  chatContainer.innerHTML = '';
  
  // Re-display messages based on active filter
  messages.forEach(message => {
    displayMessage(message);
  });
}

function declineGameInvite(inviteId: string, fromUser: string) {
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
  
  socket.send(JSON.stringify(responseMessage));
  addSystemMessage(`Declined game invitation from ${fromUser}`, MessageType.GAME);
}

function startPongGameFromInvite(opponent: string, inviteId: string) {
  addSystemMessage('Initializing Pong game...', MessageType.GAME);

  navigate(`/pong`);
}

function showUserContextMenu(event: MouseEvent, username: string) {
  // Remove any existing context menu
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
  
  // Position the menu
  menu.style.left = `${event.pageX}px`;
  menu.style.top = `${event.pageY}px`;
  
  const isBlocked = isUserBlocked(username);
  
  // Create menu items
  const menuItems = [
    {
      label: `Private Message`,
      action: () => {
        // Pre-fill the message input for private message
        const messageType = document.querySelector('select') as HTMLSelectElement;
        const messageInput = document.getElementById('message-input') as HTMLInputElement;
        messageType.value = MessageType.PRIVATE;
        messageInput.value = `@${username} `;
        messageInput.focus();
        closeContextMenu();
      }
    },
    {
      label: `Invite to Game`,
      action: () => {
        sendGameInvitation(username);
        closeContextMenu();
      }
    },
    {
      label: isBlocked ? `Unblock ${username}` : `Block ${username}`,
      action: () => {
        if (isBlocked) {
          unblockUser(username);
        } else {
          blockUser(username);
        }
        closeContextMenu();
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
  
  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu);
    document.addEventListener('contextmenu', closeContextMenu);
  }, 100);
}

function closeContextMenu() {
  const menu = document.getElementById('user-context-menu');
  if (menu) {
    menu.remove();
  }
  document.removeEventListener('click', closeContextMenu);
  document.removeEventListener('contextmenu', closeContextMenu);
}

  function updateTabStates() {
    channels.forEach(({ type }) => {
      const tab = document.getElementById(`tab-${type}`);
      if (tab) {
        if (activeFilter === type) {
          tab.style.opacity = '1';
          tab.style.transform = 'scale(0.95)';
        } else {
          tab.style.opacity = '0.7';
          tab.style.transform = 'scale(1)';
        }
      }
    });
  }

  function sendMessage() {
  const messageText = messageInput.value.trim();
  
  if (!messageText) return;
  if (socket.readyState !== WebSocket.OPEN || !isIdentified) {
    addSystemMessage('Not connected to server', MessageType.SYSTEM);
    return;
  }

  const username = sessionStorage.getItem('username') || 'Anonymous';
  
  // Check for game invite command
  const inviteMatch = messageText.match(/^\/invite\s+@?(\w+)$/i);
  if (inviteMatch) {
    const targetUser = inviteMatch[1];
    sendGameInvitation(targetUser);
    messageInput.value = '';
    return;
  }
  
  // Check for block command
  const blockMatch = messageText.match(/^\/block\s+@?(\w+)$/i);
  if (blockMatch) {
    const targetUser = blockMatch[1];
    blockUser(targetUser);
    messageInput.value = '';
    return;
  }
  
  // Check for unblock command
  const unblockMatch = messageText.match(/^\/unblock\s+@?(\w+)$/i);
  if (unblockMatch) {
    const targetUser = unblockMatch[1];
    unblockUser(targetUser);
    messageInput.value = '';
    return;
  }
  
  // Check for blocklist command
  if (messageText === '/blocklist') {
    if (blockedUsers.length === 0) {
      addSystemMessage('No blocked users', MessageType.SYSTEM);
    } else {
      addSystemMessage(`Blocked users: ${blockedUsers.join(', ')}`, MessageType.SYSTEM);
    }
    messageInput.value = '';
    return;
  }
  
  // Check for help command
  if (messageText === '/help') {
    addSystemMessage(`Available commands:
/invite @username - Invite user to play Pong
/block @username - Block a user
/unblock @username - Unblock a user  
/blocklist - Show blocked users
/help - Show this help

Tip: Right-click on usernames for quick actions!`, MessageType.SYSTEM);
    messageInput.value = '';
    return;
  }
    const messageType = typeSelector.value as MessageType;
    
    // Handle private messages with target user
    let targetUser = null;
    let content = messageText;
    
    if (messageType === MessageType.PRIVATE) {
      const whisperMatch = messageText.match(/^@(\w+)\s+(.+)$/);
      if (whisperMatch) {
        targetUser = whisperMatch[1];
        content = whisperMatch[2];
      } else {
        addSystemMessage('Private messages format: @username message', MessageType.SYSTEM);
        return;
      }
    }
    
    const message = {
      type: messageType,
      username: username,
      content: content,
      targetUser: targetUser, // For private messages
      timestamp: new Date().toISOString()
    };

    socket.send(JSON.stringify(message));
    messageInput.value = '';
  }

  // NOW CREATE THE BUTTONS AND TABS AFTER FUNCTIONS ARE DECLARED
  channels.forEach(({ type, label, color }) => {
    const tab = createButton(color, label, () => {
      activeFilter = activeFilter === type ? null : type;
      filterMessages();
      updateTabStates();
    });
    tab.id = `tab-${type}`;
    channelTabs.appendChild(tab);
  });

  // Send button
  const sendButton = createButton('lime', 'Send', sendMessage);
  sendButton.id = 'send-button';

  // Back button
  const backButton = createButton('pink', 'Back', () => navigate('/profile'));

  inputArea.appendChild(typeSelector);
  inputArea.appendChild(messageInput);
  inputArea.appendChild(sendButton);
  inputArea.appendChild(backButton);

  // Assemble the chat box
  chatBox.appendChild(chatTitle);
  chatBox.appendChild(channelTabs);
  chatBox.appendChild(chatContainer);
  chatBox.appendChild(inputArea);

  contentWrapper.appendChild(chatBox);
  container.appendChild(contentWrapper);

  // WebSocket event handlers
  socket.addEventListener('open', () => {
    console.log('WebSocket connected');
    addSystemMessage('Connected to chat server');
    addSystemMessage('Type /help for available commands', MessageType.SYSTEM);

    const username = sessionStorage.getItem('username') || 'Anonymous';
    const userId = sessionStorage.getItem('userId') || Date.now().toString();
    
    socket.send(JSON.stringify({
      type: 'identify',
      userId: userId,
      username: username
    }));
    
    isIdentified = true;
  });

  socket.addEventListener('message', (event) => {
try {
    const data = JSON.parse(event.data);
    
    if (data.type === 'game_invite_accepted') {
      addSystemMessage(`${data.username} accepted your game invitation! Starting game...`, MessageType.GAME);
      setTimeout(() => {
        startPongGameFromInvite(data.username, data.inviteId);
      }, 2000);
      return;
    }
    
    if (data.type === 'game_invite_declined') {
      addSystemMessage(`${data.username} declined your game invitation.`, MessageType.GAME);
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
      
      addMessage(message);
    } catch (e) {
      console.error('Error parsing message:', e);
      const content = event.data.toString();
      const message: ChatMessage = {
        id: Date.now().toString(),
        type: MessageType.GENERAL,
        content: content,
        timestamp: new Date()
      };
      addMessage(message);
    }
  });

  socket.addEventListener('close', () => {
    console.log('WebSocket closed');
    addSystemMessage('Disconnected from chat server', MessageType.SYSTEM);
    isIdentified = false;
  });

  socket.addEventListener('error', (e) => {
    console.error('WebSocket error', e);
    addSystemMessage('Connection error', MessageType.SYSTEM);
    isIdentified = false;
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  typeSelector.addEventListener('change', () => {
    const selectedType = typeSelector.value as MessageType;
    if (selectedType === MessageType.PRIVATE) {
      messageInput.placeholder = 'Private message: @username your message...';
    } else {
      messageInput.placeholder = 'Type your message...';
    }
  });

  function sendGameInvitation(targetUser: string) {
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

    socket.send(JSON.stringify(inviteMessage));
    addSystemMessage(`Game invitation sent to @${targetUser}`, MessageType.GAME);
  }
}

