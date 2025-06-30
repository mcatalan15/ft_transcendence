import i18n from '../i18n';
import { HeaderTest } from '../components/testmenu';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';
import { ChatMessage, MessageType } from '../types/chat.types';
import { MessageRenderer } from '../components/chat/MessageRenderer';
import { UserInteractions } from '../components/chat/UserInteractions';
import { ChatWebSocket } from '../components/chat/ChatWebSocket';

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

export function showChat(container: HTMLElement): void {
  container.innerHTML = '';
  container.className = 'grid grid-rows-[auto_1fr] h-screen overflow-hidden';

  // Add CSS for blocked user indication
  function addBlockedUserStyles() {
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
  container.appendChild(headerWrapper);

  // Main content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = `
    row-start-2 flex items-center justify-center w-full h-full
    bg-neutral-900
  `.replace(/\s+/g, ' ').trim();

  // Main chat container
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

  // State management
  const messages: ChatMessage[] = [];
  let activeFilter: MessageType | null = null;
  const currentUser = sessionStorage.getItem('username') || 'Anonymous';

  // Initialize classes
  const userInteractions = new UserInteractions(addSystemMessage, filterMessages);
  const messageRenderer = new MessageRenderer(
    currentUser,
    (username: string) => userInteractions.isUserBlocked(username),
    (event: MouseEvent, username: string) => userInteractions.showUserContextMenu(
      event, 
      username, 
      handlePrivateMessage, 
      handleGameInvite
    )
  );
  const chatWebSocket = new ChatWebSocket(addMessage, addSystemMessage);

  // Core functions
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
    // Apply filter check
    if (activeFilter && message.type !== activeFilter) return;

    const messageElement = messageRenderer.createMessageElement(
      message,
      (inviteId: string, fromUser: string) => chatWebSocket.acceptGameInvite(inviteId, fromUser),
      (inviteId: string, fromUser: string) => chatWebSocket.declineGameInvite(inviteId, fromUser)
    );

    // Only append if element has content (not blocked)
    if (messageElement.innerHTML) {
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function filterMessages() {
    chatContainer.innerHTML = '';
    messages.forEach(message => {
      displayMessage(message);
    });
  }

  function handlePrivateMessage(username: string) {
    typeSelector.value = MessageType.PRIVATE;
    messageInput.value = `@${username} `;
    messageInput.focus();
  }

  function handleGameInvite(username: string) {
    chatWebSocket.sendGameInvitation(username);
  }

  function handleCommand(messageText: string): boolean {
    // Check for game invite command
    const inviteMatch = messageText.match(/^\/invite\s+@?(\w+)$/i);
    if (inviteMatch) {
      const targetUser = inviteMatch[1];
      chatWebSocket.sendGameInvitation(targetUser);
      return true;
    }
    
    // Check for block command
    const blockMatch = messageText.match(/^\/block\s+@?(\w+)$/i);
    if (blockMatch) {
      const targetUser = blockMatch[1];
      userInteractions.blockUser(targetUser);
      return true;
    }
    
    // Check for unblock command
    const unblockMatch = messageText.match(/^\/unblock\s+@?(\w+)$/i);
    if (unblockMatch) {
      const targetUser = unblockMatch[1];
      userInteractions.unblockUser(targetUser);
      return true;
    }
    
    // Check for blocklist command
    if (messageText === '/blocklist') {
      const blockedUsers = userInteractions.getBlockedUsers();
      if (blockedUsers.length === 0) {
        addSystemMessage('No blocked users', MessageType.SYSTEM);
      } else {
        addSystemMessage(`Blocked users: ${blockedUsers.join(', ')}`, MessageType.SYSTEM);
      }
      return true;
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
      return true;
    }

    return false;
  }

  function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    // Handle commands first
    if (handleCommand(messageText)) {
      messageInput.value = '';
      return;
    }
    
    if (!chatWebSocket.isConnected()) {
      addSystemMessage('Not connected to server', MessageType.SYSTEM);
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
      username: currentUser,
      content: content,
      targetUser: targetUser,
      timestamp: new Date().toISOString()
    };

    if (chatWebSocket.sendMessage(message)) {
      messageInput.value = '';
    }
  }

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

  // Create channel tabs
  channels.forEach(({ type, label, color }) => {
    const tab = createButton(color, label, () => {
      activeFilter = activeFilter === type ? null : type;
      filterMessages();
      updateTabStates();
    });
    tab.id = `tab-${type}`;
    channelTabs.appendChild(tab);
  });

  // Create control buttons
  const sendButton = createButton('lime', 'Send', sendMessage);
  sendButton.id = 'send-button';

  const backButton = createButton('pink', 'Back', () => navigate('/profile'));

  // Assemble input area
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

  // Event listeners
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
}