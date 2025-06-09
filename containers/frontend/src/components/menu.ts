import { LanguageSelector } from './languageSelector';
import { navigate } from '../utils/router';

export class Menu {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "relative z-50";

    this.container.innerHTML = `
      <!-- Botón Menu -->
      <div id="menu-button" class="flex items-center gap-2 cursor-pointer font-bold text-amber-50 hover:text-amber-50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <span>Menu</span>
      </div>

      <!-- Overlay -->
      <div id="menu-overlay" class="hidden fixed inset-0 bg-neutral-900 z-30"></div>

      <!-- Menú de pantalla completa con animación -->
      <div id="dropdown" class="fixed inset-0 bg-neutral-900 backdrop-blur-md text-amber-50 z-40 flex flex-col transform translate-x-full opacity-0 transition-all duration-300 ease-in-out">
      <!-- Header del menú -->
      <div class="flex items-center px-6 py-6 border-b border-white/20">
        <div class="flex-1"></div>
        <div id="close-button" class="font-bold flex items-center gap-1 cursor-pointer text-amber-50 hover:text-amber-300 ml-auto">
          <span class="text-sm">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      
      <!-- Cuerpo del menú -->
      <div class="grid grid-cols-12 gap-x-12 px-12 py-12 text-xl font-semibold flex-grow">
        <!-- Columna izquierda -->
        <div class="col-span-4 flex flex-col gap-6">
          <a href="/profile" class="hover:text-teal-400 transition-colors">Perfil</a>
          <!-- Puedes añadir más navegación aquí si lo deseas -->
        </div>
      
        <!-- Columna centro (con un destacado visual) -->
        <div class="col-span-4 flex flex-col items-center gap-8">
          <a href="/pong" class="bg-amber-300 hover:bg-amber-400 text-white px-6 py-3 rounded-full shadow-lg transition-all text-2xl font-extrabold">
            Pong
          </a>
        </div>
      
        <!-- Columna derecha -->
        <div class="col-span-4 flex flex-col items-end gap-6">
          <a href="/logout"
            class="border border-amber-50 text-amber-50 px-4 py-2 rounded-full text-base hover:bg-amber-50 hover:text-black transition-colors">
            Logout
          </a>
          <a href="/about" class="font-bold hover:text-amber-300 transition-colors">About</a>
          <a href="/faq" class="font-bold hover:text-amber-300 transition-colors">FAQ</a>
        </div>
      </div>      
    `;

    this.setupEvents();
    this.insertLanguageSelector();
  }

  private setupEvents() {
    const menuButton = this.container.querySelector<HTMLElement>("#menu-button");
    const closeButton = this.container.querySelector<HTMLElement>("#close-button");
    const dropdown = this.container.querySelector<HTMLElement>("#dropdown");
    const overlay = this.container.querySelector<HTMLElement>("#menu-overlay");

    if (!menuButton || !closeButton || !dropdown || !overlay) return;

    const openMenu = () => {
      dropdown.classList.remove("translate-x-full", "opacity-0");
      overlay.classList.remove("hidden");
    };

    const closeMenu = () => {
      dropdown.classList.add("translate-x-full", "opacity-0");
      overlay.classList.add("hidden");
    };

    menuButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    // Navegación SPA
    const links = this.container.querySelectorAll('a[href^="/"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('href');
        if (path) {
          navigate(path);
          closeMenu();
        }
      });
    });
  }

  private insertLanguageSelector() {
    const slot = this.container.querySelector<HTMLElement>('#language-slot');
    if (!slot) return;

    const langSelector = new LanguageSelector().getElement();
    langSelector.classList.remove("absolute", "bottom-4", "w-full", "z-30", "justify-center");
    langSelector.classList.add("justify-start");

    slot.appendChild(langSelector);
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
