import i18n from '../i18n';
import { Header } from '../components/header';
import { LanguageSelector } from '../components/languageSelector';
import { Menu } from '../components/menu';
import { translateDOM } from '../utils/translateDOM';
import { createHomeAnimation } from '../components/homeAnimation';

export async function showHome(container: HTMLElement) {
  try {
    await i18n.loadNamespaces(['home']);
    await i18n.changeLanguage(i18n.language);
  } catch (e) { 
    console.warn('i18n fallo', e); 
  }

  // 1) Vider et configurer le layout principal
  container.innerHTML = '';
  
  // Adapter la grille selon si on a un menu ou pas
  const hasMenu = false; // Change ça selon tes besoins
  
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

  // 3) Selector de idioma
  const langSelector = new LanguageSelector(() => translateDOM()).getElement();
  langSelector.classList.add(
    'row-start-1',
    hasMenu ? 'col-start-2' : 'col-start-1',
    'justify-self-end',
    'p-4',
    'z-40'
  );
  container.appendChild(langSelector);

  // 4) Menu (si nécessaire)
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

  // 5) Zone de contenu avec animation
  const contentWrapper = document.createElement('div');
  contentWrapper.className = [
    'row-start-2',
    hasMenu ? 'col-start-2' : 'col-start-1',
    'flex',
    'items-center',
    'justify-center',
    'w-full',
    'h-full',
    'p-4', // Padding pour éviter que l'animation touche les bords
    'overflow-hidden'
  ].join(' ');
  
  // Conteneur d'animation responsive
  const animBox = document.createElement('div');
  animBox.className = [
    'relative',
    'w-full',
    'h-full',
    'max-w-[1200px]', // Taille max mais responsive
    'max-h-[800px]',  // Hauteur max mais responsive
    'min-w-[600px]',  // Taille min pour que l'animation soit jouable
    'min-h-[400px]',
    'border-2',
    'border-gray-200',
    'rounded-lg',
    'bg-white',
    'shadow-lg',
    'overflow-hidden'
  ].join(' ');

  // Animation qui s'adapte à la taille du conteneur
  const animation = createHomeAnimation();
  animation.classList.add('absolute', 'inset-0', 'w-full', 'h-full');
  animBox.appendChild(animation);

  contentWrapper.appendChild(animBox);
  container.appendChild(contentWrapper);

  // 6) Traduction finale
  translateDOM();

  // 7) Gestion responsive pour mobile
  const handleResize = () => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile && hasMenu) {
      // Sur mobile, cacher le menu et utiliser un layout simple
      container.className = [
        'grid',
        'grid-rows-[auto_1fr]',
        'h-screen',
        'overflow-hidden'
      ].join(' ');
      
      // Ajuster les classes des éléments
      headerWrapper.className = headerWrapper.className.replace('col-span-2', 'col-span-1');
      langSelector.className = langSelector.className.replace('col-start-2', 'col-start-1');
      contentWrapper.className = contentWrapper.className.replace('col-start-2', 'col-start-1');
      
      // Cacher le menu sur mobile
      //const menuWrapper = container.querySelector('.row-start-2.col-start-1');
      //if (menuWrapper && menuWrapper !== contentWrapper) {
      //  (menuWrapper as HTMLElement).style.display = 'none';
      //}
    }
  };

  // Écouter les changements de taille
  window.addEventListener('resize', handleResize);
  handleResize(); // Appel initial

  // Nettoyer l'event listener quand on quitte la page
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
  };
  
  // Stocker la fonction de nettoyage pour pouvoir l'appeler plus tard
  (container as any).__homeCleanup = cleanup;
}


/*
export function showHome(container: HTMLElement): void {
	const homeDiv = document.createElement('div');
	homeDiv.innerHTML = `
		<h1>Home</h1>
		<div><button onclick="navigate('/pong')">Play</button></div>
		<div><button onclick="navigate('/signin')">Login</button></div>
		<div><button onclick="navigate('/profile')">Profile</button></div>
		<div><button onclick="navigate('/blockchain')">Blockchain</button></div>
		<div><button onclick="navigate('/logout')">Logout</button></div>
		<select id="lang-switcher">
		<option value="fr">🇫🇷 FR</option>
		<option value="en">🇬🇧 EN</option>
		<option value="es">🇪🇸 ES</option>
		</select>
		`;

	container.appendChild(homeDiv);
  }*/
  