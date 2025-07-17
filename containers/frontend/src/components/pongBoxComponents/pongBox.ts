import { AvatarComponent } from './avatarComponent';
type PongBoxOptions = {
  avatarUrl: string;
  nickname: string;
  leftExtraContent?: HTMLElement;
  mainContent: HTMLElement;
  showCameraButton?: boolean;
  showStatus?: boolean;
};
  
export class PongBoxComponent {
  private pongBox: HTMLDivElement;

  constructor(options: PongBoxOptions) {
    this.pongBox = document.createElement('div');
    this.pongBox.className = `
      w-full max-w-[1800px] h-auto md:h-[650px]
      mx-auto bg-neutral-900 border-l-[8px] border-r-[8px] border-b-[8px] md:border-l-[16px] md:border-r-[16px] md:border-b-[16px] border-amber-50
      flex flex-col md:flex-row overflow-hidden shadow-xl
      min-h-[650px]
      relative
    `.replace(/\s+/g, ' ').trim();

    const leftCol = document.createElement('div');
    leftCol.className = `
      w-full md:w-1/3 flex flex-col items-center justify-center bg-neutral-900 pt-6 pb-10 px-4 h-full relative
    `.replace(/\s+/g, ' ').trim();

    const avatarComponent = new AvatarComponent(
      options.avatarUrl,
      options.nickname,
      options.showStatus || false,
      options.showCameraButton || false
    );
    if (options.leftExtraContent) {
      const wrapper = document.createElement('div');
      wrapper.appendChild(options.leftExtraContent);
      wrapper.appendChild(avatarComponent.getElement());
      leftCol.appendChild(wrapper);
    } else {
      leftCol.appendChild(avatarComponent.getElement());
    }

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
