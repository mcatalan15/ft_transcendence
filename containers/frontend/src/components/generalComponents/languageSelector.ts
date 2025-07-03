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
          class="inline-flex items-center px-4 py-2 bg-neutral-800 text-amber-50 rounded hover:bg-neutral-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <span id="current-lang">${currentLang.toUpperCase()}</span>
        </button>
        <ul id="lang-menu"
          class="hidden absolute bottom-full mb-2 w-full bg-neutral-800 border border-neutral-700 rounded shadow text-center">
          <li class="cursor-pointer hover:bg-neutral-700 px-4 py-2" data-lang="cat">${i18n.t("language.cat", { ns: "landing" })}</li>
          <li class="cursor-pointer hover:bg-neutral-700 px-4 py-2" data-lang="en">${i18n.t("language.en", { ns: "landing" })}</li>
          <li class="cursor-pointer hover:bg-neutral-700 px-4 py-2" data-lang="es">${i18n.t("language.es", { ns: "landing" })}</li>
          <li class="cursor-pointer hover:bg-neutral-700 px-4 py-2" data-lang="fr">${i18n.t("language.fr", { ns: "landing" })}</li>
        </ul>
      </div>
    `;

    this.setupEvents(onChange);
  }

  private setupEvents(onChange?: (lang: string) => void) {
    const btn = this.container.querySelector<HTMLButtonElement>("#language-btn");
    const menu = this.container.querySelector<HTMLUListElement>("#lang-menu");
    const langSpan = this.container.querySelector<HTMLSpanElement>("#current-lang");

    btn?.addEventListener("click", () => {
      menu?.classList.toggle("hidden");
    });

    menu?.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => {
        const lang = item.getAttribute("data-lang") || "en";
        i18n.changeLanguage(lang).then(() => {
          langSpan!.textContent = lang.toUpperCase();
          menu?.classList.add("hidden");
          translateDOM();
          if (onChange) onChange(lang);
        });
      });
    });
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
