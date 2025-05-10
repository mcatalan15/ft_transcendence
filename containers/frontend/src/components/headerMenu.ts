export class headerMenu {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement("nav");
    this.element.className = "flex gap-6 text-sm";

    const menuItems = [
      { key: "home", href: "#/home" },
      { key: "visit", href: "#/visit" },
      { key: "activities", href: "#/activities" },
      { key: "about", href: "#/about" },
    ];

    menuItems.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.setAttribute("data-i18n", `menu.${item.key}`);
      link.className = "hover:underline";
      this.element.appendChild(link);
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
