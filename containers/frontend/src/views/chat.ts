import i18n from '../i18n';
import { HeaderTest } from '../components/generalComponents/testmenu';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { navigate } from '../utils/router';
import { ChatManager, MessageType } from '../utils/chat/chat';

function createButton(color: string, text: string, action: () => void) {
  let btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `
    bg-neutral-900 text-${color}-400 border border-${color}-400 border-2
    font-medium overflow-hidden relative px-4 py-2 
    hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75
    outline-none duration-300 group text-sm
  `.replace(/\s+/g, ' ').trim();

  btn.innerHTML = `
    <span class="bg-${color}-400 shadow-${color}-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
    ${text}
  `;
  btn.onclick = action;
  return btn;
}

export function showChat(container: HTMLElement): void {
  container.innerHTML = '';
  container.className = 'grid grid-rows-[auto_1fr] h-screen overflow-hidden';

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
  headerWrapper.classList.add('row-start-1', 'w-full', 'z-30');
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
    w-full max-w-[1800px] h-[750px]
    mx-auto bg-neutral-900 border-4 border-amber-50
    flex flex-col overflow-hidden shadow-xl
    p-6
  `.replace(/\s+/g, ' ').trim();

  // Chat title
  /*const chatTitle = document.createElement('div');
  chatTitle.className = `
    text-amber-50 text-2xl font-bold tracking-wide text-center mb-4
    border-b border-amber-50/20 pb-2
  `.replace(/\s+/g, ' ').trim();
  chatTitle.textContent = 'Pong Chat';*/

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

  // Chat messages area
  const chatContainer = document.createElement('div');
  chatContainer.className = `
    flex-1 bg-neutral-800 border border-neutral-600
    overflow-y-auto p-4 mb-4 min-h-0
  `.replace(/\s+/g, ' ').trim();
  chatContainer.id = 'chat-messages';

  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'flex gap-3 items-center';

  // Message type selector
  const typeSelector = document.createElement('select') as HTMLSelectElement;
  typeSelector.className = `
    bg-neutral-800 text-amber-50 border border-amber-50/30
    px-3 py-2 text-sm min-w-[100px]
  `.replace(/\s+/g, ' ').trim();
  typeSelector.innerHTML = `
    <option value="${MessageType.GENERAL}">General</option>
    <option value="${MessageType.PRIVATE}">Whisper</option>
    <option value="${MessageType.FRIEND}">Friend</option>
  `;

  // Message input
  const messageInput = document.createElement('input') as HTMLInputElement;
  messageInput.type = 'text';
  messageInput.placeholder = 'Type your message...';
  messageInput.className = `
    flex-1 bg-neutral-800 text-amber-50 border border-amber-50/30 
    px-4 py-2 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
  `.replace(/\s+/g, ' ').trim();
  messageInput.id = 'message-input';

  // Initialize chat manager
  const chatManager = new ChatManager();
  let activeFilter: MessageType | null = null;

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
      chatManager.setActiveFilter(activeFilter);
      updateTabStates();
    });
    tab.id = `tab-${type}`;
    channelTabs.appendChild(tab);
  });

  // Send button
  const sendButton = createButton('lime', 'Send', () => chatManager.sendMessage());
  sendButton.id = 'send-button';

  // Back button
  const backButton = createButton('pink', 'Back', () => navigate('/profile'));

  inputArea.appendChild(typeSelector);
  inputArea.appendChild(messageInput);
  inputArea.appendChild(sendButton);
  inputArea.appendChild(backButton);

  // Assemble the chat box
  //chatBox.appendChild(chatTitle);
  chatBox.appendChild(channelTabs);
  chatBox.appendChild(chatContainer);
  chatBox.appendChild(inputArea);

  contentWrapper.appendChild(chatBox);
  container.appendChild(contentWrapper);

  // Initialize chat manager with DOM elements
  chatManager.initialize(chatContainer, messageInput, typeSelector);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    chatManager.disconnect();
  });
}