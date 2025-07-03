import i18n from '../i18n';
import { HeaderTest } from '../components/generalComponents/testmenu';
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { navigate } from '../utils/router';
import { PongBoxComponent } from '../components/profileComponents/pongBoxComponents/pongBox';
import { HeadersComponent } from '../components/profileComponents/pongBoxComponents/headersComponent';

export function showSettings(container: HTMLElement): void {
    i18n
        .loadNamespaces('settings')
        .then(() => i18n.changeLanguage(i18n.language))
        .then(() => {
            container.innerHTML = '';

            const topBar = document.createElement('div');
            topBar.className = 'w-full flex flex-row justify-between items-center px-8 pt-4';
        // Language selector
            const langSelector = new LanguageSelector(() => showSettings(container)).getElement();
        // Testmenu
            const testMenu = new HeaderTest().getElement();
            topBar.appendChild(langSelector);
            topBar.appendChild(testMenu);

            const lang = i18n.language || 'en';
            const svgHeader = new HeadersComponent({
                type: 'settings',
                lang,
                className: 'absolute left-1/2 -translate-x-1/2 top-0 z-30 w-full max-w-[1800px] h-auto pointer-events-none select-none',
                style: {
                    marginTop: '0',
                    top: '0',
                    transform: 'translateX(-50%)',
                    position: 'absolute',
                    width: '100%',
                    maxWidth: '1800px',
                    height: 'auto',
                    zIndex: '30',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    bottom: 'unset',
                    left: '50%',
                    right: 'unset',
                    display: 'block',
                    marginBottom: '0',
                    marginLeft: '0',
                    marginRight: '0',
                }
            }).getElement();

            const borderMobile = 8;
            const borderDesktop = 16;
            function updateSvgMargin() {
                const isMobile = window.innerWidth < 768;
                svgHeader.style.marginTop = `-${isMobile ? borderMobile * 3.2 : borderDesktop * 3.4}px`;
            }
            updateSvgMargin();
            window.addEventListener('resize', updateSvgMargin);

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'flex flex-col items-center justify-center w-full h-full bg-neutral-900';

            const pongBoxContent = document.createElement('div');
            pongBoxContent.className = 'flex flex-col w-full';

            const pongBox = new PongBoxComponent({
              avatarUrl: '',
              nickname: '',
              mainContent: pongBoxContent,
              onArrowClick: () => {
                // Navega a tu perfil (ajusta la ruta si es necesario)
                navigate('/profile');
              }
            });
            const pongBoxElement = pongBox.getElement();
            pongBoxElement.style.marginTop = '-16px';

            const mainColumn = document.createElement('div');
            mainColumn.className = 'flex flex-col items-center w-full';
            const headerPongBoxWrapper = document.createElement('div');
            headerPongBoxWrapper.className = 'relative flex flex-col items-center w-full';
            headerPongBoxWrapper.appendChild(svgHeader);
            headerPongBoxWrapper.appendChild(pongBoxElement);
            mainColumn.appendChild(headerPongBoxWrapper);

            contentWrapper.appendChild(topBar);
            contentWrapper.appendChild(mainColumn);
            container.appendChild(contentWrapper);

                    fetch('/api/profile', {
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                    })
                      .then(response => response.json())
                      .then(data => {
                        const nicknameEl = pongBoxElement.querySelector('span.text-amber-50');
                        const avatarImg = pongBoxElement.querySelector('img');
                        const userId = sessionStorage.getItem('userId') || 'defaultUserId';

                        if (nicknameEl)
                          nicknameEl.textContent = data.username;
                        if (avatarImg) {
                          (avatarImg as HTMLImageElement).src = `/api/profile/avatar/${userId}?t=${Date.now()}`;

                          const avatarWrapper = document.createElement('div');
                          avatarWrapper.className = 'relative inline-block';
                          avatarImg.parentNode?.insertBefore(avatarWrapper, avatarImg);
                          avatarWrapper.appendChild(avatarImg);
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = 'image/jpeg,image/png,image/gif';
                          fileInput.style.display = 'none';
                          const statusBtn = document.createElement('button');
                          statusBtn.type = 'button';
                          statusBtn.className = 'absolute bottom-0 right-0 w-20 h-20 bg-amber-50 border-2 border-amber-50 rounded-full flex items-center justify-center p-0 focus:outline-none transition group overflow-hidden';
                          statusBtn.innerHTML = `
                            <svg class="transition-transform duration-200 ease-in-out group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="32" height="32">
                              <rect x="3" y="7" width="18" height="14" rx="3" fill="#171717" stroke="#171717" stroke-width="2"/>
                              <circle cx="12" cy="14" r="4" fill="#fff" stroke="#171717" stroke-width="2"/>
                              <rect x="8" y="3" width="8" height="4" rx="2" fill="#171717"/>
                            </svg>
                          `;
                          statusBtn.onclick = () => fileInput.click();
                          avatarWrapper.appendChild(statusBtn);
                          fileInput.onchange = async (e) => {
                            const target = e.target as HTMLInputElement;
                            const file = target.files?.[0];
                            if (!file) return;
                            // Validar tamaño (por ejemplo, 2MB)
                            const maxSize = 2 * 1024 * 1024; // 2MB
                            if (file.size > maxSize) {
                              showErrorMessage('Image too large (max 2MB)');
                              // Limpiar el valor del input para permitir volver a seleccionar el mismo archivo
                              fileInput.value = '';
                              return;
                            }
                            const formData = new FormData();
                            formData.append('avatar', file);
                            try {
                              const response = await fetch('/api/profile/avatar', {
                                method: 'POST',
                                credentials: 'include',
                                body: formData
                              });
                              if (response.ok) {
                                avatarImg.src = `/api/profile/avatar/${userId}?t=${Date.now()}`;
                                showSuccessMessage('Avatar updated successfully!');
                              } else {
                                showErrorMessage('Failed to update avatar');
                              }
                            } catch (error) {
                              console.error('Avatar upload error:', error);
                              showErrorMessage('Error uploading avatar');
                            }
                          };
                        }
                      })
                      .catch(error => {
                        navigate('/home');
                        console.error('Error fetching profile:', error);
                      });
    });

    // Crear el contenedor de mensajes solo si no existe ya
    let messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.id = 'messageContainer';
      messageContainer.className = 'fixed top-20 right-4 z-50';
      container.appendChild(messageContainer);
    }
}

function showSuccessMessage(message: string) {
  showMessage(message, 'success');
}

function showErrorMessage(message: string) {
  showMessage(message, 'error');
}

function showMessage(message: string, type: 'success' | 'error') {
  // Buscar el avatarWrapper si existe
  let avatarWrapper = document.querySelector('.relative.inline-block');
  let messageContainer = document.getElementById('messageContainer');

  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'messageContainer';
    // Siempre en el centro de la pantalla
    messageContainer.className = 'fixed inset-0 flex items-center justify-center z-50 pointer-events-none';
    document.body.appendChild(messageContainer);
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `
    px-4 py-3 rounded-lg shadow-lg max-w-xs pointer-events-auto text-center
    ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
  `.replace(/\s+/g, ' ').trim();
  messageDiv.textContent = message;

  messageContainer.appendChild(messageDiv);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
    // Si el contenedor queda vacío, lo eliminamos
    if (messageContainer && messageContainer.childElementCount === 0) {
      messageContainer.remove();
    }
  }, 3000);
}