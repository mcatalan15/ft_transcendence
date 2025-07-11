import i18n from "../../i18n";
import { translateDOM } from "../../utils/translateDOM";

export class LanguageSelector {
  private container: HTMLElement;

  constructor(onChange?: (lang: string) => void) {
    const currentLang = i18n.resolvedLanguage || "en";

    this.container = document.createElement("div");
    this.container.className = "absolute bottom-4 w-full flex justify-center z-30";
    this.container.innerHTML = `
      <div class="relative inline-block text-left">
        <button id="language-btn"
          class="gaming-language-btn inline-flex items-center px-4 py-2 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <span id="current-lang">${currentLang.toUpperCase()}</span>
        </button>
        <ul id="lang-menu"
          class="gaming-lang-menu hidden absolute bottom-full mb-2 w-full text-center">
          <li class="gaming-lang-item cursor-pointer" data-lang="cat">${i18n.t("language.cat", { ns: "landing" })}</li>
          <li class="gaming-lang-item cursor-pointer" data-lang="en">${i18n.t("language.en", { ns: "landing" })}</li>
          <li class="gaming-lang-item cursor-pointer" data-lang="es">${i18n.t("language.es", { ns: "landing" })}</li>
          <li class="gaming-lang-item cursor-pointer" data-lang="fr">${i18n.t("language.fr", { ns: "landing" })}</li>
        </ul>
      </div>
    `;

    this.setupGamingStyles();
    this.setupEvents(onChange);
  }

  private setupGamingStyles(): void {
    const langBtn = this.container.querySelector('#language-btn') as HTMLButtonElement;
    if (langBtn) {
      langBtn.style.backgroundColor = 'transparent';
      langBtn.style.border = '2px solid #FFFBEB';
      langBtn.style.color = '#FFFBEB';
      langBtn.style.fontFamily = '"Roboto Mono", monospace';
      langBtn.style.fontWeight = 'bold';
      langBtn.style.fontSize = '12px';
      langBtn.style.textTransform = 'uppercase';
      langBtn.style.borderRadius = '0px';
      langBtn.style.cursor = 'pointer';

      langBtn.addEventListener('mouseenter', () => {
        langBtn.style.backgroundColor = '#FFFBEB';
        langBtn.style.color = '#171717';
      });

      langBtn.addEventListener('mouseleave', () => {
        langBtn.style.backgroundColor = 'transparent';
        langBtn.style.color = '#FFFBEB';
      });
    }

    const langMenu = this.container.querySelector('#lang-menu') as HTMLUListElement;
    if (langMenu) {
      langMenu.style.backgroundColor = '#171717';
      langMenu.style.border = '2px solid #FFFBEB';
      langMenu.style.borderRadius = '0px';
      langMenu.style.boxShadow = 'none';
    }

    const langItems = this.container.querySelectorAll('.gaming-lang-item');
    langItems.forEach(item => {
      const htmlItem = item as HTMLElement;
      htmlItem.style.fontFamily = '"Roboto Mono", monospace';
      htmlItem.style.fontWeight = 'bold';
      htmlItem.style.fontSize = '12px';
      htmlItem.style.textTransform = 'uppercase';
      htmlItem.style.color = '#FFFBEB';
      htmlItem.style.padding = '8px 16px';
      htmlItem.style.borderBottom = '1px solid rgba(255, 251, 235, 0.2)';
      htmlItem.style.transition = 'all 0.3s ease';

      htmlItem.addEventListener('mouseenter', () => {
        htmlItem.style.backgroundColor = '#FFFBEB';
        htmlItem.style.color = '#171717';
      });

      htmlItem.addEventListener('mouseleave', () => {
        htmlItem.style.backgroundColor = 'transparent';
        htmlItem.style.color = '#FFFBEB';
      });
    });

    const lastItem = langItems[langItems.length - 1] as HTMLElement;
    if (lastItem) {
      lastItem.style.borderBottom = 'none';
    }
  }

private setupEvents(onChange?: (lang: string) => void) {
  const btn = this.container.querySelector<HTMLButtonElement>("#language-btn");
  const menu = this.container.querySelector<HTMLUListElement>("#lang-menu");
  const langSpan = this.container.querySelector<HTMLSpanElement>("#current-lang");

  btn?.addEventListener("click", () => {
      menu?.classList.toggle("hidden");
  });

  document.addEventListener('click', (event) => {
      if (!this.container.contains(event.target as Node)) {
          menu?.classList.add("hidden");
      }
  });

  menu?.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", async () => {
          const lang = item.getAttribute("data-lang") || "en";
          
          await this.cleanupBeforeLanguageChange();
          
          i18n.changeLanguage(lang).then(() => {
              langSpan!.textContent = lang.toUpperCase();
              menu?.classList.add("hidden");
              translateDOM();
              if (onChange) onChange(lang);
              
              setTimeout(() => {
                  window.location.reload();
              }, 100);
          });
      });
  });
}

  private async cleanupBeforeLanguageChange(): Promise<void> {
    try {
        const gameInstance = (window as any).currentGame;
        const menuInstance = (window as any).currentMenu;
        
        if (gameInstance && typeof gameInstance.cleanup === 'function') {
            await gameInstance.cleanup();
        }
        
        if (menuInstance && typeof menuInstance.cleanup === 'function') {
            await menuInstance.cleanup();
        }
        
        (window as any).currentGame = null;
        (window as any).currentMenu = null;
        
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

  public getElement(): HTMLElement {
    return this.container;
  }
}