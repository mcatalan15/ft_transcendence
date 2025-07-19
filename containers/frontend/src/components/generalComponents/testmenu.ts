import { navigate } from '../../utils/router';
import i18n from '../../i18n';

export class HeaderTest {
    private element: HTMLElement;

    constructor() {
        this.element = document.createElement('header');
        this.element.className = 'fixed top-0 left-0 w-full bg-neutral-900 shadow-sm z-10';
        const userProfileURL = sessionStorage.getItem('username') ? `/profile/${sessionStorage.getItem('username')}` : '/profile';
        const userHistoryURL = sessionStorage.getItem('username') ? `/history/${sessionStorage.getItem('username')}` : '/history';
        this.element.innerHTML = `
	<nav class="bg-neutral-900 fixed w-full z-20 top-0 start-0 border-b border-amber-50">
	<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-1">
		<div data-route="/home" class="flex items-center gap-1 py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-transparent cursor-pointer">
            <span>P</span>
            <button id="bounce-button" class="w-5 h-5 md:w-5 md:h-5 bg-amber-400 rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300 cursor-pointer border-0 focus:outline-none"></button>
            <span>NG</span>
        </div>
		<div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
			<button type="button" class="gaming-logout-btn" data-route="/logout">${i18n.t('logout', { ns: 'menu'})}</button>
		</div>
		<div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
		<ul class="flex flex-col p-3 md:p-0 mt-4 font-medium border border-neutral-900 rounded-lg bg-neutral-900 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-neutral-900">
			<li>
			<button data-route="${userProfileURL}" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-amber-400 md:hover:bg-transparent md:hover:text-amber-400 md:p-0 nav-link cursor-pointer" aria-current="page">${i18n.t('profile', { ns: 'menu'})}</button>
			</li>
			<li>
			<button data-route="/pong" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-amber-400 md:hover:bg-transparent md:hover:text-amber-400 md:p-0 nav-link cursor-pointer">${i18n.t('pong', { ns: 'menu'})}</button>
			</li>
            <li>
			<button data-route="${userHistoryURL}" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-amber-400 md:hover:bg-transparent md:hover:text-amber-400 md:p-0 nav-link cursor-pointer">${i18n.t('history', { ns: 'menu'})}</button>
			</li>
			<li>
			<button data-route="/friends" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-amber-400 md:hover:bg-transparent md:hover:text-amber-400 md:p-0 nav-link cursor-pointer">${i18n.t('friends', { ns: 'menu'})}</button>
			</li>
			<li>
			<button data-route="/chat" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-smhover:bg-amber-400 md:hover:bg-transparent md:hover:text-amber-400 md:p-0 nav-link cursor-pointer">${i18n.t('chat', { ns: 'menu'})}</button>
			</li>
		</ul>
		</div>
	</div>
	</nav>
	`;

        this.setupEventListeners();
        this.setupGamingLogoutButton();
    }

    private setupGamingLogoutButton(): void {
        const logoutBtn = this.element.querySelector('.gaming-logout-btn') as HTMLButtonElement;
        if (!logoutBtn) return;

        logoutBtn.style.backgroundColor = 'transparent';
        logoutBtn.style.border = '2px solid #FFFBEB';
        logoutBtn.style.color = '#FFFBEB';
        logoutBtn.style.fontFamily = '"Roboto Mono", monospace';
        logoutBtn.style.fontWeight = 'bold';
        logoutBtn.style.fontSize = '12px';
        logoutBtn.style.textTransform = 'uppercase';
        logoutBtn.style.padding = '8px 16px';
        logoutBtn.style.borderRadius = '0px';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.style.transition = 'all 0.3s ease';

        logoutBtn.addEventListener('mouseenter', () => {
            logoutBtn.style.backgroundColor = '#FFFBEB';
            logoutBtn.style.color = '#171717';
        });

        logoutBtn.addEventListener('mouseleave', () => {
            logoutBtn.style.backgroundColor = 'transparent';
            logoutBtn.style.color = '#FFFBEB';
        });
    }

    private setupEventListeners(): void {
        this.element.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const navLink = target.closest('[data-route]') as HTMLElement;
            
            if (navLink && navLink.dataset.route) {
                event.preventDefault();
                const route = navLink.dataset.route;
                this.updateActiveState(route);
                navigate(route);
            }
        });
        
        const homeContainer = this.element.querySelector('[data-route="/home"]');
        const bounceButton = homeContainer?.querySelector('#bounce-button');
        if (bounceButton) {
            bounceButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateActiveState('/home');
                navigate('/home');
            });
        }
    }

    private updateActiveState(currentRoute: string): void {
        const navLinks = this.element.querySelectorAll('.nav-link[data-route]');
        navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            link.classList.remove('active');
        });

        if (currentRoute !== '/logout') {
            const activeLink = this.element.querySelector(`[data-route="${currentRoute}"]`);
            if (activeLink && activeLink.classList.contains('nav-link')) {
                activeLink.setAttribute('aria-current', 'page');
                activeLink.classList.add('active');
            }
        }
    }

    public setActiveRoute(route: string): void {
        this.updateActiveState(route);
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}