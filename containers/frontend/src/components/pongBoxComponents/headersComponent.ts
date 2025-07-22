type HeadersComponentOptions = {
  type: string;
  lang: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
};

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

export class HeadersComponent {
  private element: HTMLImageElement;

  constructor(options: HeadersComponentOptions) {
    this.element = document.createElement('img');
    this.element.src = `/headers/headers_${options.type}_${options.lang}.svg`;
    this.element.alt = `${options.type} Header`;
    this.element.className = 'absolute left-1/2 -translate-x-1/2 top-0 z-30 w-full max-w-[1800px] h-auto pointer-events-none select-none block mx-auto';
    this.element.style.objectFit = 'contain';
    const defaultStyle: Partial<CSSStyleDeclaration> = {
      marginTop: '0px',
      top: '0',
      transform: 'translateX(-50%)',
      position: 'absolute',
      width: '100%',
      maxWidth: !isFirefox ? '1817.5px' : '1800px',
      height: 'auto',
      zIndex: '30',
      pointerEvents: 'none',
      userSelect: 'none',
      bottom: 'unset',
      left: '50%',
      right: 'unset',
      display: 'block',
      marginBottom: '0',
      marginLeft: '0',
      marginRight: '0',
    };
    Object.assign(this.element.style, defaultStyle);
    if (options.className) {
      this.element.className += ' ' + options.className;
    }
    if (options.style) {
      Object.assign(this.element.style, options.style);
    }
  }

  getElement() {
    return this.element;
  }
}
