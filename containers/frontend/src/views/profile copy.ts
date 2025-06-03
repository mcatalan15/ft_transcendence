import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';

export async function showProfile(container: HTMLElement) {
	try {
		await i18n.loadNamespaces(['profile']);
		await i18n.changeLanguage(i18n.language);
	} catch (e) {
		console.warn('i18n profile:error', e);
	}

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
  
	// 2) Header
	const headerWrapper = new Header().getElement();
	headerWrapper.classList.add(
	  'row-start-1',
	  hasMenu ? 'col-span-2' : 'col-span-1',
	  'w-full',
	  'z-30'
	);
	container.appendChild(headerWrapper);
  
	// 3) Selector Language
	const langSelector = new LanguageSelector(() => translateDOM()).getElement();
	langSelector.classList.add(
	  'row-start-1',
	  hasMenu ? 'col-start-2' : 'col-start-1',
	  'justify-self-end',
	  'p-4',
	  'z-40'
	);
	container.appendChild(langSelector);
  
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


	const profileDiv = document.createElement('div');
	profileDiv.innerHTML = `
		<h1>Profile</h1>
		<p id="profileInfo"></p>
		<button style='margin-right:16px' onclick="navigate('/home')">Return home</button>
	`;

	const profileInfo = profileDiv.querySelector('#profileInfo') as HTMLParagraphElement;

	// Fetch and display user profile information
	fetch('/api/profile', {
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
	})
		.then(response => response.json())
		.then(data => {
			profileInfo.innerHTML = `
			<div>ID: ${data.id}</div>
			<div>Username: ${data.username}</div>
			<div>Email: ${data.email}</div>
		  `;
		})
		.catch(error => {
			navigate('/home');
 			console.error('Error fetching profile:', error);
		});

	container.innerHTML = '';
	container.appendChild(profileDiv);

	translateDOM();
}