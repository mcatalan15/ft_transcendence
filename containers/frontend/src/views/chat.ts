import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { navigate } from '../utils/router';

// Message types for different chat categories
enum MessageType {
  GENERAL = 'general',
  PRIVATE = 'private',
  SERVER = 'server',
  SYSTEM = 'system',
  FRIEND = 'friend',
  GAME = 'game'
}

interface ChatMessage {
  id: string;
  type: MessageType;
  username?: string;
  content: string;
  timestamp: Date;
  channel?: string;
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
    default:
      return `${baseStyle} bg-neutral-800 border-neutral-400 text-neutral-100`;
  }
}

function formatMessage(message: ChatMessage): string {
  const timestamp = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  switch (message.type) {
    case MessageType.PRIVATE:
      return `<span class="text-pink-300">[${timestamp}] [WHISPER] ${message.username}:</span> ${message.content}`;
    case MessageType.SERVER:
      return `<span class="text-amber-300">[${timestamp}] [SERVER]</span> ${message.content}`;
    case MessageType.SYSTEM:
      return `<span class="text-red-300">[${timestamp}] [SYSTEM]</span> ${message.content}`;
    case MessageType.FRIEND:
      return `<span class="text-lime-300">[${timestamp}] [FRIEND] ${message.username}:</span> ${message.content}`;
    case MessageType.GAME:
      return `<span class="text-blue-300">[${timestamp}] [GAME]</span> ${message.content}`;
    case MessageType.GENERAL:
    default:
      return `<span class="text-cyan-300">[${timestamp}] ${message.username}:</span> ${message.content}`;
  }
}

export function showChat(container: HTMLElement): void {
  container.innerHTML = '';
  container.className = 'grid grid-rows-[auto_1fr] h-screen overflow-hidden';

  // Header
  const headerWrapper = new Header().getElement();
  headerWrapper.classList.add('row-start-1', 'w-full', 'z-30');
  container.appendChild(headerWrapper);

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
  chatTitle.textContent = 'Transcendence Chat';

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
    if (activeFilter && message.type !== activeFilter) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = getMessageStyle(message.type);
    messageDiv.innerHTML = formatMessage(message);
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function filterMessages() {
    chatContainer.innerHTML = '';
    messages.forEach(message => {
      if (!activeFilter || message.type === activeFilter) {
        displayMessage(message);
      }
    });
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
    
    // Identify user to server
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
      
      // Convert timestamp string back to Date object
      const message: ChatMessage = {
        id: data.id || Date.now().toString(),
        type: data.type as MessageType,
        username: data.username,
        content: data.content,
        timestamp: new Date(data.timestamp),
        channel: data.channel
      };
      
      addMessage(message);
    } catch (e) {
      console.error('Error parsing message:', e);
      // Handle plain text messages (legacy)
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

  // Event listeners for input
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Update placeholder text based on message type
  typeSelector.addEventListener('change', () => {
    const selectedType = typeSelector.value as MessageType;
    if (selectedType === MessageType.PRIVATE) {
      messageInput.placeholder = 'Private message: @username your message...';
    } else {
      messageInput.placeholder = 'Type your message...';
    }
  });
}