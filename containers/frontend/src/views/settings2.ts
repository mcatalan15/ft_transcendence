import i18n from '../i18n';
//import { Header } from '../components/header';
import { HeaderTest } from '../components/generalComponents/testmenu'
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { navigate } from '../utils/router';
import { changeNickname, changePassword } from '../utils/profile/profileUtils';
import { HeadersComponent } from '../components/profileComponents/pongBoxComponents/headersComponent';
import { PongBoxComponent } from '../components/profileComponents/pongBoxComponents/pongBox';
import { getApiUrl } from '../config/api';

function createButton(color: string, text: string, action: () => void) {
  let btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `
    bg-${color}-950 text-${color}-400 border border-${color}-400 border-b-4
    font-medium overflow-hidden relative px-8 py-3 rounded-md
    hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75
    outline-none duration-300 group w-full max-w-xs text-base md:text-xl
  `.replace(/\s+/g, ' ').trim();

  btn.innerHTML = `
    <span class="bg-${color}-400 shadow-${color}-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
    ${text}
  `;
  btn.onclick = action;
  return btn;
}

function createFormField(id: string, type: string, placeholder: string, required: boolean = true) {
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.placeholder = placeholder;
  input.required = required;
  input.className = `
    w-full border border-gray-300 px-4 py-3 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
    bg-white text-gray-900
  `.replace(/\s+/g, ' ').trim();
  return input;
}

export async function showSettings(container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  // Datos de usuario
  const userId = sessionStorage.getItem('userId') || 'defaultUserId';
  const avatarUrl = `${getApiUrl('/profile/avatar')}/${userId}?t=${Date.now()}`;
  const username = sessionStorage.getItem('username') || '';
  const lang = i18n.language || 'en';

  // Header SVG
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

  // TopBar
  const topBar = document.createElement('div');
  topBar.className = 'w-full flex flex-row justify-between items-center px-8 pt-4';
  const langSelector = new LanguageSelector(() => showSettings(container)).getElement();
  const testMenu = new HeaderTest().getElement();
  topBar.appendChild(langSelector);
  topBar.appendChild(testMenu);

  // Avatar y título
  const leftCol = document.createElement('div');
  leftCol.className = 'flex flex-col items-center w-full';
  // Título eliminado según petición
  const avatarImg = document.createElement('img');
  avatarImg.src = avatarUrl;
  avatarImg.alt = 'Profile';
  avatarImg.className = 'w-32 h-32 md:w-56 md:h-56 rounded-full border-4 border-amber-50 object-cover transition-all duration-300 mt-4 mb-2 mx-auto';
  leftCol.appendChild(avatarImg);
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/png,image/gif';
  fileInput.style.display = 'none';
  const avatarLabel = document.createElement('span');
  avatarLabel.className = 'mt-2 text-amber-400 text-sm text-center cursor-pointer hover:text-amber-500';
  avatarLabel.textContent = 'Click here to change avatar';
  avatarLabel.onclick = () => fileInput.click();
  fileInput.onchange = async (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await fetch(getApiUrl('/profile/avatar'), {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (response.ok) {
        avatarImg.src = `${getApiUrl('/profile/avatar')}/${userId}?t=${Date.now()}`;
        showSuccessMessage('Avatar updated successfully!');
      } else {
        showErrorMessage('Failed to update avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showErrorMessage('Error uploading avatar');
    }
  };
  leftCol.appendChild(avatarLabel);
  leftCol.appendChild(fileInput);

  // Forms
  const mainContent = document.createElement('div');
  mainContent.className = 'flex flex-col items-center w-full';
  const middleCol = document.createElement('div');
  middleCol.className = 'w-full md:w-1/3 flex flex-col place-items-center mt-12 md:mt-24 bg-neutral-900 gap-6 px-6 py-8';

  // Nickname form
  const nicknameForm = document.createElement('div');
  nicknameForm.className = 'w-full max-w-xs bg-neutral-900 border-2 border-amber-400 p-6 rounded-lg shadow-lg';
  const nicknameTitle = document.createElement('h3');
  nicknameTitle.className = 'text-xl font-bold text-amber-400 mb-4 text-center';
  nicknameTitle.textContent = 'Change Nickname';
  const currentNicknameField = createFormField('currentNickname', 'text', 'Current nickname', false);
  currentNicknameField.value = username;
  currentNicknameField.disabled = true;
  currentNicknameField.className += ' bg-gray-100';
  const newNicknameField = createFormField('newNickname', 'text', 'New nickname');
  const nicknameBtn = createButton('cyan', 'Update Nickname', async () => {
    const newNickname = newNicknameField.value.trim();
    if (!newNickname) {
      showErrorMessage('Please enter a new nickname');
      return;
    }
    if (newNickname.length < 3 || newNickname.length > 8) {
      showErrorMessage('Nickname must be between 3 and 8 characters');
      return;
    }
    if (!/^(?=[a-zA-Z0-9-]{3,8}$)(?!-)(?!.*-.*-)[a-zA-Z0-9-]+$/.test(newNickname)) {
      showErrorMessage('Nickname can only contain letters, numbers and a single hyphen');
      return;
    }
    changeNickname(newNickname);
  });
  nicknameForm.appendChild(nicknameTitle);
  nicknameForm.appendChild(currentNicknameField);
  nicknameForm.appendChild(document.createElement('br'));
  nicknameForm.appendChild(newNicknameField);
  nicknameForm.appendChild(document.createElement('br'));
  nicknameForm.appendChild(nicknameBtn);
  middleCol.appendChild(nicknameForm);

  // Password form
  if (sessionStorage.getItem('localAuth') === 'true') {
    const passwordForm = document.createElement('div');
    passwordForm.className = 'w-full max-w-xs bg-neutral-800 border-2 border-amber-400 p-6 rounded-lg shadow-lg';
    const passwordTitle = document.createElement('h3');
    passwordTitle.className = 'text-xl font-bold text-amber-400 mb-4 text-center';
    passwordTitle.textContent = 'Change Password';
    const currentPasswordField = createFormField('currentPassword', 'password', 'Current password');
    const newPasswordField = createFormField('newPassword', 'password', 'New password');
    const confirmPasswordField = createFormField('confirmPassword', 'password', 'Confirm new password');
    const passwordBtn = createButton('lime', 'Update Password', async () => {
      const currentPassword = currentPasswordField.value;
      const newPassword = newPasswordField.value;
      const confirmPassword = confirmPasswordField.value;
      if (!currentPassword || !newPassword || !confirmPassword) {
        showErrorMessage('All password fields are required');
        return;
      }
      if (newPassword.length < 6 || newPassword.length > 20) {
        showErrorMessage('Password must be between 6 and 20 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        showErrorMessage('New passwords do not match');
        return;
      }
      if (currentPassword === newPassword) {
        showErrorMessage('New password cannot be the same as the current password');
        return;
      }
      changePassword(currentPassword, newPassword);
    });
    passwordForm.appendChild(passwordTitle);
    passwordForm.appendChild(currentPasswordField);
    passwordForm.appendChild(document.createElement('br'));
    passwordForm.appendChild(newPasswordField);
    passwordForm.appendChild(document.createElement('br'));
    passwordForm.appendChild(confirmPasswordField);
    passwordForm.appendChild(document.createElement('br'));
    passwordForm.appendChild(passwordBtn);
    middleCol.appendChild(passwordForm);
  }

  mainContent.appendChild(middleCol);

  // Navegación
  const btnGrid = document.createElement('div');
  btnGrid.className = 'grid grid-cols-1 gap-5 md:gap-10 w-full max-w-xs ml-auto mt-8';
  const buttons = [
    { label: 'Back to Profile', action: () => navigate('/profile'), color: 'amber' },
    { label: 'Dashboard', action: () => navigate('/dashboard'), color: 'pink' }
  ];
  buttons.forEach(({ color, label, action }) => {
    const btn = createButton(color, label, action);
    btnGrid.appendChild(btn);
  });
  mainContent.appendChild(btnGrid);

  // PongBox
  const pongBox = new PongBoxComponent({
    avatarUrl,
    nickname: username,
    leftExtraContent: leftCol,
    mainContent: mainContent
  });

  // Layout wrapper
  const mainColumn = document.createElement('div');
  mainColumn.className = 'relative flex flex-col items-center w-full';
  mainColumn.appendChild(svgHeader);
  mainColumn.appendChild(topBar);
  mainColumn.appendChild(pongBox.getElement());
  container.appendChild(mainColumn);

  // Mensajes
  const messageContainer = document.createElement('div');
  messageContainer.id = 'messageContainer';
  messageContainer.className = 'fixed top-20 right-4 z-50';
  container.appendChild(messageContainer);
}

function showSuccessMessage(message: string) {
  showMessage(message, 'success');
}

function showErrorMessage(message: string) {
  showMessage(message, 'error');
}

function showMessage(message: string, type: 'success' | 'error') {
  const messageContainer = document.getElementById('messageContainer');
  if (!messageContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `
    px-4 py-3 rounded-lg shadow-lg mb-2 max-w-sm
    ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
  `.replace(/\s+/g, ' ').trim();
  messageDiv.textContent = message;

  messageContainer.appendChild(messageDiv);

  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}