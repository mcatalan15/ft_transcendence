import { Menu } from './menu';

export class Header {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('header');
    this.element.className = 'fixed top-0 left-0 w-full bg-white shadow-sm z-50';

    const nav = document.createElement('nav');
    nav.className = 'relative max-w-7xl mx-auto flex items-center justify-between p-4';

    const title = document.createElement('a');
    title.href = '/home';
    title.className = 'text-xl font-semibold';
    title.setAttribute('data-i18n', 'header.title');

    const menu = new Menu().getElement();

    nav.appendChild(title);
    nav.appendChild(menu);
    this.element.appendChild(nav);
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
