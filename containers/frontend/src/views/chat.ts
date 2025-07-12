import i18n from '../i18n';
import { HeaderTest } from '../components/generalComponents/testmenu';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { navigate } from '../utils/router';
import { ChatManager, MessageType } from '../utils/chat/chat';
import { HeadersComponent } from '../components/pongBoxComponents/headersComponent';
import { CONFIG } from '../config/settings.config';

let currentResizeHandler: (() => void) | null = null;

function createButton(color: string, text: string, action: () => void) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  
  // Mapa de colores para convertir los nombres de color a códigos hexadecimales
  const colorMap: { [key: string]: string } = {
    'cyan': '#22d3ee',
    'pink': '#f472b6',
    'lime': '#84cc16',
    'blue': '#3b82f6',
    'amber': '#FFFBEB'
  };
  
  // Obtener el color del mapa o usar el predeterminado si no existe
  const buttonColor = colorMap[color] || '#FFFBEB';
  
  // Aplicar estilos inline similares a setupGamingLogoutButton
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
  
  // Añadir listeners para efectos hover
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
  // Inicializar i18n para la vista de chat
  await i18n.loadNamespaces('chat');
  await i18n.changeLanguage(i18n.language);
  
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

  // Agregar selector de idioma antes del contenido principal
  const langSelector = new LanguageSelector(() => showChat(container)).getElement();
  container.appendChild(langSelector);

  // Main content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = `
    row-start-2 flex flex-col items-center justify-center w-full h-full
    bg-neutral-900 relative
  `.replace(/\s+/g, ' ').trim();

  // Header container para posicionar mejor el SVG
  const headerContainer = document.createElement('div');
  headerContainer.className = 'w-full relative';
  
  // Crear y agregar el SVG header
  const svgHeader = createHeader();
  headerContainer.appendChild(svgHeader);
  contentWrapper.appendChild(headerContainer);
  
  // Agregar un contenedor de posicionamiento para el chat box
  const chatBoxContainer = document.createElement('div');
  // Quitar mt-16 para permitir que el centrado vertical funcione correctamente
  chatBoxContainer.className = 'w-full max-w-[1800px] mx-auto flex justify-center'; 
  
  // Main chat container - usando los mismos bordes y dimensiones que PongBox
  const chatBox = document.createElement('div');
  chatBox.className = `
    w-full
    mx-auto bg-neutral-900 border-l-[8px] border-r-[8px] border-b-[8px] md:border-l-[16px] md:border-r-[16px] md:border-b-[16px] border-amber-50
    flex flex-col overflow-hidden shadow-xl
    p-6 h-[665px]
  `.replace(/\s+/g, ' ').trim();

  // Channel tabs/filters
  const channelTabs = document.createElement('div');
  channelTabs.className = 'flex gap-2 mb-4 flex-wrap';
  
  const channels = [
    { type: MessageType.GENERAL, label: i18n.t('general', { ns: "chat" }), color: 'cyan' },
    { type: MessageType.PRIVATE, label: 'whispers', color: 'pink' },
    { type: MessageType.FRIEND, label: 'friends', color: 'lime' },
    { type: MessageType.GAME, label: 'game', color: 'blue' },
    { type: MessageType.SERVER, label: 'server', color: 'amber' },
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
  
  // Se añadirán las opciones en updateTranslations()

  // Message input
  const messageInput = document.createElement('input') as HTMLInputElement;
  messageInput.type = 'text';
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

  // Create channel tabs and buttons (se rellenarán en updateTranslations)
  const sendButton = createButton('lime', i18n.t('send', { ns: 'chat' }), () => chatManager.sendMessage());
  sendButton.id = 'send-button';
  
  const backButton = createButton('pink', i18n.t('back', { ns: 'chat' }), () => navigate('/profile'));
  backButton.id = 'back-button';

  // Función para actualizar todas las traducciones
  function updateTranslations() {
    // Actualizar placeholder
    messageInput.placeholder = i18n.t('typeMessage', { ns: 'chat' });
    
    // Actualizar selector de tipo de mensaje
    typeSelector.innerHTML = `
      <option value="${MessageType.GENERAL}">${i18n.t('general', { ns: 'chat' })}</option>
      <option value="${MessageType.PRIVATE}">${i18n.t('whispers', { ns: 'chat' })}</option>
      <option value="${MessageType.FRIEND}">${i18n.t('friends', { ns: 'chat' })}</option>
    `;
    
    // Actualizar botones
    sendButton.textContent = i18n.t('send', { ns: 'chat' });
    backButton.textContent = i18n.t('back', { ns: 'chat' });
    
    // Limpiar y recrear pestañas de canales
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
    
    // Actualizar estado activo de las pestañas
    updateTabStates();
  }

  // Construir la interfaz
  inputArea.appendChild(typeSelector);
  inputArea.appendChild(messageInput);
  inputArea.appendChild(sendButton);
  inputArea.appendChild(backButton);

  chatBox.appendChild(channelTabs);
  chatBox.appendChild(chatContainer);
  chatBox.appendChild(inputArea);

  chatBoxContainer.appendChild(chatBox);
  contentWrapper.appendChild(chatBoxContainer);
  container.appendChild(contentWrapper);

  // Eliminar la línea que estaba añadiendo el selector de idioma otra vez dentro del contentWrapper
  // Esto puede estar causando conflicto o duplicación

  // Inicializar traducciones
  updateTranslations();

  // Initialize chat manager with DOM elements
  chatManager.initialize(chatContainer, messageInput, typeSelector);

  // Configurar el manejador de redimensionamiento
  function handleResize() {
    updateHeaderMargin();
  }

  function updateHeaderMargin() {
    const isMobile = window.innerWidth < CONFIG.BREAKPOINTS.mobile;
    const multiplier = isMobile ? CONFIG.MULTIPLIERS.mobile : CONFIG.MULTIPLIERS.desktop;
    const border = isMobile ? CONFIG.BORDER_VALUES.mobile : CONFIG.BORDER_VALUES.desktop;
    
    // Mantener la posición original del header que ya estaba bien
    const headerOffset = isMobile ? -35 : -50;
    svgHeader.style.marginTop = `-${border * multiplier + headerOffset}px`;
  }

  // Aplicar margen inicial
  updateHeaderMargin();

  currentResizeHandler = handleResize;
  window.addEventListener('resize', handleResize);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cleanup();
    chatManager.disconnect();
  });
}

function createHeader(): HTMLElement {
  const lang = i18n.language || 'en';
  const svgHeader = new HeadersComponent({
    type: 'chat',
    lang,
    style: {
      position: 'absolute',
      top: '-65px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '1800px',
      zIndex: '40'
    }
  }).getElement();
  
  return svgHeader;
}

function cleanup(): void {
  if (currentResizeHandler) {
    window.removeEventListener('resize', currentResizeHandler);
    currentResizeHandler = null;
  }
}

export function setResizeHandler(handler: (() => void) | null): void {
  currentResizeHandler = handler;
}