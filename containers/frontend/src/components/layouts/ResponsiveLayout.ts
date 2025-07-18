import { RESPONSIVE_CONFIG } from '../../config/responsive.config';
import { LanguageSelector } from '../generalComponents/languageSelector';
import { HeaderTest } from '../generalComponents/testmenu';
import { HeadersComponent } from '../pongBoxComponents/headersComponent';

export class ResponsiveLayout {
  private container: HTMLElement;
  private contentWrapper: HTMLDivElement;
  private mainColumn: HTMLDivElement;
  private contentBox: HTMLElement | null = null;
  private headerElement: HTMLElement | null = null;
  
  constructor(container: HTMLElement) {
    this.container = container;
    
    this.contentWrapper = document.createElement('div');
    this.contentWrapper.className = 'flex flex-col items-center justify-center w-full h-full bg-neutral-900 px-2 sm:px-4';
    this.mainColumn = document.createElement('div');
    this.mainColumn.className = 'flex flex-col items-center w-full max-w-full relative';
    this.contentWrapper.appendChild(this.mainColumn);
  }

  public initialize(refreshCallback?: () => void): void {
    this.container.innerHTML = '';
    const langSelector = new LanguageSelector(refreshCallback || (() => {})).getElement();
    this.container.appendChild(langSelector);
    const headerTest = new HeaderTest().getElement();
    headerTest.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-50');
    this.container.appendChild(headerTest);
    this.container.appendChild(this.contentWrapper);
  }
  
  public addHeader(type: string, lang: string = 'en'): HTMLElement {
    const header = new HeadersComponent({
      type,
      lang,
    }).getElement();
    header.classList.add(
      'absolute', 'left-1/2', '-translate-x-1/2', 'top-0',
      'w-full', 'max-w-screen-xl', 'z-40', 'pointer-events-none',
      'object-contain', 'sm:scale-95', 'md:scale-100'
    );
    
    this.headerElement = header;
    this.mainColumn.appendChild(header);
    return header;
  }
  
  public addContentBox(element: HTMLElement): void {
    this.contentBox = element;
    const contentBoxWrapper = document.createElement('div');
    contentBoxWrapper.className = 'relative flex flex-col items-center w-full pt-5 sm:pt-6 md:pt-8';
    this.applyConsistentBoxDimensions(element);
    
    contentBoxWrapper.appendChild(element);
    this.mainColumn.appendChild(contentBoxWrapper);
    if (this.headerElement) {
      setTimeout(() => this.updateHeaderPosition(), 0);
    }
  }
  
  private updateHeaderPosition(): void {
    if (!this.headerElement || !this.contentBox) return;
    
    const windowWidth = window.innerWidth;
    const headerTopOffset = RESPONSIVE_CONFIG.getResponsiveValue('headerTopOffset', windowWidth);

    this.headerElement.style.marginTop = `${headerTopOffset}px`;
    const contentBoxWidth = this.contentBox.offsetWidth;
    this.headerElement.style.maxWidth = `${contentBoxWidth}px`;
  }
  
  public getContentContainer(): HTMLElement {
    return this.mainColumn;
  }
  
  public applyConsistentBoxDimensions(boxElement: HTMLElement): void {
    const resizeBox = () => {
      const containerWidth = Math.min(
        this.container.clientWidth - 32,
        RESPONSIVE_CONFIG.base.width
      );
      
      const width = Math.min(containerWidth, RESPONSIVE_CONFIG.base.width);
      const height = width / RESPONSIVE_CONFIG.base.aspectRatio;
      
      boxElement.style.width = `${width}px`;
      boxElement.style.height = `${height}px`;
      boxElement.style.maxWidth = '100%';
      
      boxElement.style.minHeight = ''; 
      
      boxElement.style.marginLeft = 'auto';
      boxElement.style.marginRight = 'auto';
    };
    
    resizeBox();
    
    window.addEventListener('resize', resizeBox);
    
    window.addEventListener('load', resizeBox);
  }
}
