import { AvatarComponent } from './avatarComponent';
type PongBoxOptions = {
  avatarUrl: string;
  nickname: string;
  leftExtraContent?: HTMLElement;
  mainContent: HTMLElement;
  //onArrowClick?: () => void;
};
  
export class PongBoxComponent {
  private pongBox: HTMLDivElement;

  constructor(options: PongBoxOptions) {
    this.pongBox = document.createElement('div');
    this.pongBox.className = `
      w-full max-w-[1800px] h-auto md:h-[665px]
      mx-auto bg-neutral-900 border-l-[8px] border-r-[8px] border-b-[8px] md:border-l-[16px] md:border-r-[16px] md:border-b-[16px] border-amber-50
      flex flex-col md:flex-row overflow-hidden shadow-xl
      min-h-[600px]
      relative
    `.replace(/\s+/g, ' ').trim();

    /*let arrowBtn: HTMLButtonElement | null = null;
    let arrowRow: HTMLDivElement | null = null;
    if (options.onArrowClick) {
      arrowBtn = document.createElement('button');
      arrowBtn.type = 'button';
      arrowBtn.className = 'bg-neutral-900/80 rounded-full p-2 hover:bg-amber-100 transition-colors shadow-md';
      arrowBtn.innerHTML = `
        <svg class="w-16 h-16 text-amber-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
        </svg>
      `;
      arrowBtn.onclick = (e) => {
        e.stopPropagation();
        options.onArrowClick && options.onArrowClick();
      };
      arrowRow = document.createElement('div');
      arrowRow.className = 'flex w-full justify-start mb-2';
      arrowRow.appendChild(arrowBtn);
    }*/

    const leftCol = document.createElement('div');
    leftCol.className = `
      w-full md:w-1/3 flex flex-col items-center justify-center bg-neutral-900 pt-6 pb-10 px-4 h-full relative
    `.replace(/\s+/g, ' ').trim();

    const avatarComponent = new AvatarComponent(options.avatarUrl, options.nickname);
    if (options.leftExtraContent) {
      const wrapper = document.createElement('div');
      wrapper.appendChild(options.leftExtraContent);
      wrapper.appendChild(avatarComponent.getElement());
      leftCol.appendChild(wrapper);
    } else {
      leftCol.appendChild(avatarComponent.getElement());
    }

    /*if (arrowRow) {
      arrowRow.style.position = 'absolute';
      arrowRow.style.left = '1rem'; // Más a la izquierda
      arrowRow.style.bottom = '1.5rem';
      leftCol.appendChild(arrowRow);
    }*/

    const mainCol = document.createElement('div');
    mainCol.className = `
      w-full md:w-2/3 flex flex-col items-center justify-center bg-neutral-900
    `.replace(/\s+/g, ' ').trim();
    mainCol.appendChild(options.mainContent);

    this.pongBox.appendChild(leftCol);
    this.pongBox.appendChild(mainCol);
  }

  getElement() {
    return this.pongBox;
  }
}
  