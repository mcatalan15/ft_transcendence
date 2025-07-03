type HeadersComponentOptions = {
  type: string;
  lang: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
};

export class HeadersComponent {
  private element: HTMLImageElement;

  constructor(options: HeadersComponentOptions) {
    this.element = document.createElement('img');
    this.element.src = `/headers/headers_${options.type}_${options.lang}.svg`;
    this.element.alt = `${options.type} Header`;
    this.element.className =
      'block mx-auto z-20 w-full max-w-[1800px] h-auto pointer-events-none select-none' +
      (options.className ? ' ' + options.className : '');
    this.element.style.objectFit = 'contain';
    if (options.style) {
      Object.assign(this.element.style, options.style);
    }
  }

  getElement() {
    return this.element;
  }
}
