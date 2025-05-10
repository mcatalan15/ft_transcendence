import { LanguageSelector } from './languageSelector';

export class Menu {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "relative z-50";

    this.container.innerHTML = `
      <!-- Botón Menu -->
      <div id="menu-button" class="flex items-center gap-2 cursor-pointer text-gray-800 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <span>Menu</span>
      </div>

      <!-- Overlay -->
      <div id="menu-overlay" class="hidden fixed inset-0 bg-black/50 z-30"></div>

      <!-- Menú de pantalla completa -->
      <div id="dropdown" class="hidden fixed inset-0 bg-black/70 backdrop-blur-md text-white z-40 flex flex-col">
        <!-- Header del menú -->
        <div class="flex items-center justify-between px-6 py-6 border-b border-white/20">
          <div id="language-slot" class="flex justify-start"></div>
          <div id="close-button" class="flex items-center gap-1 cursor-pointer text-white hover:text-amber-300 ml-2">
            <span class="text-sm">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <!-- Cuerpo del menú -->
        <div class="grid grid-cols-12 gap-x-12 px-10 py-12 text-xl flex-grow">
          <!-- Columna izquierda (Perfil) -->
          <div class="col-span-3 space-y-6">
            <a href="/profile" class="block hover:text-amber-300">Perfil</a>
          </div>

          <!-- Columna centro (Pong) -->
          <div class="col-span-3 space-y-6">
            <a href="/pong" class="block hover:text-amber-300">Pong</a>
          </div>

          <!-- Columna derecha (Logout, About, FAQ) -->
          <div class="col-span-4 space-y-6 text-right">
            <a href="/logout"
               class="inline-block border border-amber-50 text-amber-50 px-4 py-2 rounded-full text-sm hover:bg-amber-50 hover:text-black transition-colors">
              Logout
            </a>
            <div class="h-8"></div>
            <a href="/about" class="block hover:text-amber-300">About</a>
            <a href="/faq" class="block hover:text-amber-300">FAQ</a>
          </div>
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
      dropdown.classList.remove("hidden");
      overlay.classList.remove("hidden");
    };

    const closeMenu = () => {
      dropdown.classList.add("hidden");
      overlay.classList.add("hidden");
    };

    menuButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
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
