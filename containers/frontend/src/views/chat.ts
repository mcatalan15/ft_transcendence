import i18n from '../i18n';
import { navigate } from '../utils/router';
import { ChatManager, MessageType } from '../utils/chat/chat';
import { ResponsiveLayout } from '../components/layouts/ResponsiveLayout';

function createButton(color: string, text: string, action: () => void) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  
  const colorMap: { [key: string]: string } = {
    'cyan': '#22d3ee',
    'pink': '#f472b6',
    'lime': '#84cc16',
    'blue': '#3b82f6',
    'amber': '#FFFBEB'
  };
  
  const buttonColor = colorMap[color] || '#FFFBEB';
  
  Object.assign(btn.style, {
    backgroundColor: 'transparent',
    border: `2px solid ${buttonColor}`,
    color: buttonColor,
    fontFamily: '"Roboto Mono", monospace',
    fontWeight: 'bold',
    fontSize: '12px',
    textTransform: 'uppercase',
    padding: '8px 16px',
    borderRadius: '0px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0 4px',
    minWidth: '80px'
  });
  
  btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = buttonColor;
    btn.style.color = '#171717';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = 'transparent';
    btn.style.color = buttonColor;
  });
  
  btn.onclick = action;
  return btn;
}

export async function showChat(container: HTMLElement): Promise<void> {
  await i18n.loadNamespaces('chat');
  await i18n.changeLanguage(i18n.language);
  
  const layout = new ResponsiveLayout(container);
  layout.initialize(() => showChat(container));
  
  const svgHeader = layout.addHeader('chat', i18n.language || 'en');
  
  const mainContainer = layout.getContentContainer();
  if (mainContainer) {
    mainContainer.style.paddingTop = '0';
    mainContainer.style.marginTop = '0'; 
  }
  
  const chatMainContent = createChatMainContent();
  
  const chatBox = document.createElement('div');
  chatBox.className = `
    w-full mx-auto
    bg-neutral-900 
    border-l-[3px] border-r-[3px] border-b-[3px]
    sm:border-l-[6px] sm:border-r-[6px] sm:border-b-[6px]
    md:border-l-[8px] md:border-r-[8px] md:border-b-[8px]
    lg:border-l-[12px] lg:border-r-[12px] lg:border-b-[12px]
    border-amber-50
    flex flex-col overflow-hidden shadow-xl
  `.replace(/\s+/g, ' ').trim();
  
  chatBox.style.marginTop = '10px';
  chatBox.style.position = 'relative';
  chatBox.style.zIndex = '10';
  
  chatBox.appendChild(chatMainContent);
  
  const contentBoxWrapper = document.createElement('div');
  contentBoxWrapper.className = 'relative flex flex-col items-center w-full';
  contentBoxWrapper.style.paddingTop = '25px';
  
  layout.applyConsistentBoxDimensions(chatBox);
  
  contentBoxWrapper.appendChild(chatBox);
  mainContainer.appendChild(contentBoxWrapper);
  

  if (svgHeader) {
    const headerTopOffset = -32; 
    svgHeader.style.marginTop = `${headerTopOffset}px`;
    svgHeader.style.zIndex = '40';
  }
}

function createChatMainContent() {
  const chatMainContent = document.createElement('div');
  chatMainContent.className = 'w-full h-full flex flex-col p-4';
  
  const channelTabs = document.createElement('div');
  channelTabs.className = 'flex gap-2 mb-4 flex-wrap';
  
  const channels = [
    { type: MessageType.GENERAL, label: i18n.t('general', { ns: "chat" }), color: 'cyan' },
    { type: MessageType.PRIVATE, label: 'whispers', color: 'pink' },
    { type: MessageType.FRIEND, label: 'friends', color: 'lime' },
    { type: MessageType.GAME, label: 'game', color: 'blue' },
    { type: MessageType.SERVER, label: 'server', color: 'amber' },
  ];

  const chatContainer = document.createElement('div');
  chatContainer.className = `
    flex-1 bg-neutral-800 border border-neutral-600
    overflow-y-auto p-4 mb-4 min-h-0
  `.replace(/\s+/g, ' ').trim();
  chatContainer.id = 'chat-messages';
  chatContainer.style.fontFamily = '"Roboto Mono", monospace';

  const inputArea = document.createElement('div');
  inputArea.className = 'flex gap-3 items-center';

  const typeSelector = document.createElement('select') as HTMLSelectElement;
  typeSelector.className = `
    bg-neutral-800 text-amber-50 border border-amber-50/30
    px-3 py-2 text-sm min-w-[100px]
  `.replace(/\s+/g, ' ').trim();
  typeSelector.id = 'message-type';
  typeSelector.name = 'messageType';
  
  Object.assign(typeSelector.style, {
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '12px',
    textTransform: 'uppercase'
  });

  const messageInput = document.createElement('input') as HTMLInputElement;
  messageInput.type = 'text';
  messageInput.className = `
    flex-1 bg-neutral-800 text-amber-50 border border-amber-50/30 
    px-4 py-2 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
  `.replace(/\s+/g, ' ').trim();
  messageInput.id = 'message-input';
  //messageInput.name = 'message';
  
  Object.assign(messageInput.style, {
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '12px'
  });

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

  const sendButton = createButton('lime', i18n.t('send', { ns: 'chat' }), () => chatManager.sendMessage());
  sendButton.id = 'send-button';
  
  const backButton = createButton('pink', i18n.t('back', { ns: 'chat' }), () => navigate('/home'));
  backButton.id = 'back-button';

  function updateTranslations() {
    messageInput.placeholder = i18n.t('typeMessage', { ns: 'chat' });
    
    typeSelector.innerHTML = `
      <option value="${MessageType.GENERAL}">${i18n.t('general', { ns: 'chat' })}</option>
      <option value="${MessageType.PRIVATE}">${i18n.t('whispers', { ns: 'chat' })}</option>
      <option value="${MessageType.FRIEND}">${i18n.t('friends', { ns: 'chat' })}</option>
    `;
    
    sendButton.textContent = i18n.t('send', { ns: 'chat' });
    backButton.textContent = i18n.t('back', { ns: 'chat' });
    
    channelTabs.innerHTML = '';
    channels.forEach(({ type, label, color }) => {
      const tab = createButton(color, i18n.t(label, { ns: 'chat' }), () => {
        activeFilter = activeFilter === type ? null : type;
        chatManager.setActiveFilter(activeFilter);
        updateTabStates();
      });
      tab.id = `tab-${type}`;
      channelTabs.appendChild(tab);
    });
    
    updateTabStates();
  }

  inputArea.appendChild(typeSelector);
  inputArea.appendChild(messageInput);
  inputArea.appendChild(sendButton);
  inputArea.appendChild(backButton);

  chatMainContent.appendChild(channelTabs);
  chatMainContent.appendChild(chatContainer);
  chatMainContent.appendChild(inputArea);

  updateTranslations();
  chatManager.initialize(chatContainer, messageInput, typeSelector);

  window.addEventListener('beforeunload', () => {
    chatManager.disconnect();
  });

  return chatMainContent;
}