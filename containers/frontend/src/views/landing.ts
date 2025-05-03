import i18n from './i18n';

export function showLanding(container: HTMLElement): void {
    // Vérifier que i18next est initialisé
    if (!i18next.isInitialized) {
        console.error("i18next n'est pas initialisé");
        // Fallback pour éviter l'écran blanc
        initFallbackUI(container);
        return;
    }

    const landingDiv = document.createElement('div');
    landingDiv.innerHTML = `
        <div class="fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden" id="landing-wrapper">
            <div id="animation-layer" class="fixed inset-0 z-0 pointer-events-none"></div>
            
            <div class="relative h-full flex flex-col">

                <div class="pt-6 w-full flex justify-center gap-x-4 z-30">
                    <button id="sign-in-btn"
                        class="bg-amber-50 text-neutral-900 px-4 py-2 rounded hover:bg-amber-100 transition-colors z-30 relative">
                        Sign in
                    </button>
                    <button id="sign-up-btn"
                        class="border border-amber-50 text-amber-50 px-4 py-2 rounded hover:bg-neutral-800 transition-colors z-30 relative">
                        Sign up
                    </button>
                </div>
                
                <div class="flex-grow flex items-center justify-center">
                    <div class="text-8xl md:text-9xl font-anatol flex items-center space-x-4 z-10">
                        <span>P</span>
                        <button id="bounce-button"
                            class="w-12 h-12 md:w-16 md:h-16 bg-amber-400 rounded-full animate-bounce shadow-lg hover:scale-110 transition duration-300 cursor-pointer z-10"
                            title="">
                        </button>
                        <span>NG</span>
                    </div>
                </div>
                
                <div class="h-16"></div>
            </div>
            
            <div id="language-switcher" class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                <button id="lang-btn" class="p-2 hover:scale-110 transition-transform text-white" aria-label="Change language">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor"
                        class="w-10 h-10">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                </button>

                <div id="lang-menu"
                    class="hidden absolute bottom-12 left-1/2 -translate-x-1/2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 text-sm text-gray-700">
                    <button data-lang="en" class="block w-full px-4 py-2 hover:bg-gray-100">English</button>
                    <button data-lang="es" class="block w-full px-4 py-2 hover:bg-gray-100">Español</button>
                    <button data-lang="fr" class="block w-full px-4 py-2 hover:bg-gray-100">Français</button>
                </div>
            </div>
        </div>
    `;

    container.appendChild(landingDiv);
    
    // Récupération des éléments DOM - une seule fois
    const signInBtn = landingDiv.querySelector('#sign-in-btn') as HTMLButtonElement;
    const signUpBtn = landingDiv.querySelector('#sign-up-btn') as HTMLButtonElement;
    const langBtn = landingDiv.querySelector('#lang-btn') as HTMLButtonElement;
    const langMenu = landingDiv.querySelector('#lang-menu') as HTMLDivElement;
    const animationLayer = landingDiv.querySelector('#animation-layer') as HTMLDivElement;
    const bounceBtn = landingDiv.querySelector('#bounce-button') as HTMLButtonElement;
    
    // Fonction pour mettre à jour les textes selon la langue
    function updateTexts() {
        try {
            if (signInBtn) signInBtn.textContent = i18next.t('sign_in') || 'Sign in';
            if (signUpBtn) signUpBtn.textContent = i18next.t('sign_up') || 'Sign up';

            langMenu.querySelectorAll('button').forEach((btn) => {
                const langCode = (btn as HTMLElement).dataset.lang!;
                btn.textContent = i18next.t(`language_${langCode}`) || 
                                 (langCode === 'en' ? 'English' : 
                                  langCode === 'es' ? 'Español' : 
                                  langCode === 'fr' ? 'Français' : langCode);
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des textes:', error);
        }
    }

    // Gestion du menu de langue
    langBtn.addEventListener('click', () => {
        langMenu.classList.toggle('hidden');
    });

    // Gestion du changement de langue
    langMenu.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const lang = (e.target as HTMLElement).dataset.lang!;
            i18next.changeLanguage(lang)
                .then(() => {
                    langMenu.classList.add('hidden');
                    updateTexts();
                })
                .catch(err => {
                    console.error('Erreur lors du changement de langue:', err);
                });
        });
    });

    // Navigation
    signInBtn.addEventListener('click', (e) => {
        console.log("Sign in clicked via addEventListener");
        e.stopPropagation();
        window.location.href = '/signin';
    });
    
    signUpBtn.addEventListener('click', (e) => {
        console.log("Sign up clicked via addEventListener");
        e.stopPropagation();
        window.location.href = '/signup';
    });

    // Animation des balles
    const balls: HTMLDivElement[] = [];

    bounceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = bounceBtn.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        const ball = document.createElement('div');
        ball.className = 'w-4 h-4 bg-amber-400 rounded-full absolute z-0 pointer-events-none';
        ball.style.left = `${startX}px`;
        ball.style.top = `${startY}px`;
        
        animationLayer.appendChild(ball);

        let x = startX;
        let y = startY;
        let dx = (Math.random() - 0.5) * 6;
        let dy = (Math.random() - 0.5) * 6;

        const updatePosition = () => {
            const maxX = window.innerWidth - 16;
            const maxY = window.innerHeight - 16;

            x += dx;
            y += dy;

            if (x <= 0 || x >= maxX) dx = -dx;
            if (y <= 0 || y >= maxY) dy = -dy;

            ball.style.left = `${x}px`;
            ball.style.top = `${y}px`;

            requestAnimationFrame(updatePosition);
        };

        updatePosition();
        balls.push(ball);

        if (balls.length > 50) {
            const oldest = balls.shift();
            if (oldest) animationLayer.removeChild(oldest);
        }
    });

    // Initialiser les textes une fois
    try {
        updateTexts();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des textes:', error);
    }
}

// Fonction de secours en cas d'échec d'i18next
function initFallbackUI(container: HTMLElement): void {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.innerHTML = `
        <div class="fixed inset-0 bg-neutral-900 text-amber-50 overflow-hidden" id="landing-wrapper">
            <div class="relative h-full flex flex-col items-center justify-center">
                <div class="text-8xl md:text-9xl font-anatol flex items-center space-x-4 z-10">
                    <span>P</span>
                    <div class="w-12 h-12 md:w-16 md:h-16 bg-amber-400 rounded-full shadow-lg"></div>
                    <span>NG</span>
                </div>
                <div class="mt-8">
                    <button class="bg-amber-50 text-neutral-900 px-4 py-2 rounded mx-2">Sign in</button>
                    <button class="border border-amber-50 text-amber-50 px-4 py-2 rounded mx-2">Sign up</button>
                </div>
            </div>
        </div>
    `;
    container.appendChild(fallbackDiv);
}