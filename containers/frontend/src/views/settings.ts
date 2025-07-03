import i18n from '../i18n';
//import { Header } from '../components/header';
import { HeaderTest } from '../components/testmenu'
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { navigate } from '../utils/router';
import { changeNickname, changePassword } from '../utils/profile/profileUtils';
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
  await i18n.loadNamespaces('profile');
  container.innerHTML = '';
  
  const hasMenu = false;
  
  if (hasMenu) {
    container.className = [
      'grid',
      'grid-rows-[auto_1fr]',
      'grid-cols-[200px_1fr]',
      'h-screen',
      'overflow-hidden'
    ].join(' ');
  } else {
    container.className = [
      'grid',
      'grid-rows-[auto_1fr]',
      'h-screen',
      'overflow-hidden'
    ].join(' ');
  }

  // Header
  const headerWrapper = new HeaderTest().getElement();
  headerWrapper.classList.add(
    'row-start-1',
    hasMenu ? 'col-span-2' : 'col-span-1',
    'w-full',
    'z-30'
  );
  container.appendChild(headerWrapper);

  // Language selector
  const langSelector = new LanguageSelector(() => showSettings(container)).getElement();
  langSelector.classList.add(
    'row-start-1',
    hasMenu ? 'col-start-2' : 'col-start-1',
    'justify-self-end',
    'p-4',
    'z-40'
  );
  container.appendChild(langSelector);

  // Menu (if needed)
  if (hasMenu) {
    const menuWrapper = new Menu().getElement();
    menuWrapper.classList.add(
      'row-start-2',
      'col-start-1',
      'h-full',
      'overflow-auto',
      'bg-gray-50',
      'border-r',
      'z-20'
    );
    container.appendChild(menuWrapper);
  }

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = [
    'row-start-2',
    hasMenu ? 'col-start-2' : 'col-start-1',
    'flex',
    'items-center',
    'justify-center',
    'w-full',
    'h-full',
    'bg-neutral-900'
  ].join(' ');

  // Main ping pong box (reusing profile design)
  const pingpongBox = document.createElement('div');
  pingpongBox.className = `
    w-full max-w-[1800px] h-auto md:h-[750px]
    mx-auto bg-neutral-900 border-4 border-amber-400
    flex flex-col md:flex-row overflow-hidden shadow-xl
    min-h-[600px]
  `.replace(/\s+/g, ' ').trim();

  // LEFT COL - Avatar section
  const leftCol = document.createElement('div');
  leftCol.className = `
    w-full md:w-1/3 flex flex-col justify-items-start
    bg-neutral-900 pt-6 pb-10 px-4 h-full relative
  `.replace(/\s+/g, ' ').trim();

  const settingsTitle = document.createElement('div');
  settingsTitle.className = `
    text-amber-400 text-7xl font-anatol tracking-wide break-all text-left w-full mb-5
  `.replace(/\s+/g, ' ').trim();
  settingsTitle.textContent = i18n.t('settings', { ns: 'profile' }) || 'Ajustes';

  const centerCol = document.createElement('div');
  centerCol.className = "flex flex-col place-items-center gap-4 w-full mt-32";

  // Avatar section
  const avatar = document.createElement('img');
  avatar.alt = 'Profile';
  avatar.className = `
    w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-amber-400 object-cover
    shadow-xl transition-all duration-300 cursor-pointer hover:opacity-80
  `.replace(/\s+/g, ' ').trim();

  const currentUser = sessionStorage.getItem('username');
  const currentUserId = sessionStorage.getItem('userId');
  avatar.src = getApiUrl(`/profile/avatar/${currentUserId}?t=${Date.now()}`);

  // Avatar upload functionality
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/png,image/gif';
  fileInput.style.display = 'none';

  const avatarLabel = document.createElement('span');
  avatarLabel.className = `
    mt-2 text-amber-400 text-sm text-center cursor-pointer hover:text-amber-500
  `.replace(/\s+/g, ' ').trim();
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
        // Refresh avatar
        avatar.src = getApiUrl(`/profile/avatar/${currentUserId}?t=${Date.now()}`);
        showSuccessMessage('Avatar updated successfully!');
      } else {
        showErrorMessage('Failed to update avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showErrorMessage('Error uploading avatar');
    }
  };

  centerCol.appendChild(avatar);
  centerCol.appendChild(avatarLabel);
  centerCol.appendChild(fileInput);
  leftCol.appendChild(settingsTitle);
  leftCol.appendChild(centerCol);

  // MIDDLE COL - Forms
  const middleCol = document.createElement('div');
  middleCol.className = `
    w-full md:w-1/3 flex flex-col place-items-center mt-12 md:mt-24
    bg-neutral-900 gap-6 px-6 py-8
  `.replace(/\s+/g, ' ').trim();

  // Nickname change form
  const nicknameForm = document.createElement('div');
  nicknameForm.className = 'w-full max-w-xs bg-neutral-900 border-2 border-amber-400 p-6 rounded-lg shadow-lg';
  
  const nicknameTitle = document.createElement('h3');
  nicknameTitle.className = 'text-xl font-bold text-amber-400 mb-4 text-center';
  nicknameTitle.textContent = 'Change Nickname';
  
  const currentNicknameField = createFormField('currentNickname', 'text', 'Current nickname', false);
  currentNicknameField.value = currentUser || '';
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
  // RIGHT COL - Navigation buttons
  const rightCol = document.createElement('div');
  rightCol.className = `
    w-full md:w-1/3 flex flex-col justify-items-end-safe py-48 px-12 pr-24
    bg-neutral-900
  `.replace(/\s+/g, ' ').trim();

  const btnGrid = document.createElement('div');
  btnGrid.className = 'grid grid-cols-1 gap-5 md:gap-10 w-full max-w-xs ml-auto';

  const buttons = [
    {
      label: 'Back to Profile',
      action: () => navigate('/profile'),
      color: 'amber'
    },
    {
      label: 'Dashboard',
      action: () => navigate('/dashboard'),
      color: 'pink'
    }
  ];

  buttons.forEach(({ color, label, action }) => {
    const btn = createButton(color, label, action);
    btnGrid.appendChild(btn);
  });

  rightCol.appendChild(btnGrid);

  // Message container for success/error messages
  const messageContainer = document.createElement('div');
  messageContainer.id = 'messageContainer';
  messageContainer.className = 'fixed top-20 right-4 z-50';

  // Assemble the layout
  pingpongBox.appendChild(leftCol);
  pingpongBox.appendChild(middleCol);
  pingpongBox.appendChild(rightCol);
  contentWrapper.appendChild(pingpongBox);
  container.appendChild(contentWrapper);
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

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}