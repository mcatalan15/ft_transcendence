type PongBoxOptions = {
    title: string;
    avatarUrl: string;
    nickname: string;
    leftExtraContent?: HTMLElement;
    mainContent: HTMLElement;
  };
  
  export class PongBoxComponent {
    private pongBox: HTMLDivElement;
  
    constructor(options: PongBoxOptions) {
      this.pongBox = document.createElement('div');
      this.pongBox.className = `
        w-full max-w-[1800px] h-auto md:h-[750px]
        mx-auto bg-neutral-900 border-[16px] 
        flex flex-col md:flex-row overflow-hidden shadow-xl
        min-h-[600px]
      `.replace(/\s+/g, ' ').trim();
  
      const leftCol = document.createElement('div');
      leftCol.className = `
        w-full md:w-1/3 flex flex-col items-center
        bg-neutral-900 pt-6 pb-10 px-4 h-full relative
      `.replace(/\s+/g, ' ').trim();
  
      const profileTitle = document.createElement('div');
      profileTitle.className = `
        text-amber-50 text-7xl font-anatol tracking-wide break-all text-left w-full mb-6
      `.replace(/\s+/g, ' ').trim();
      profileTitle.textContent = options.title;
  
      const avatar = document.createElement('img');
      avatar.src = options.avatarUrl;
      avatar.alt = 'Profile';
      avatar.className = `
        w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-amber-50 object-cover
         transition-all duration-300 mt-20
      `.replace(/\s+/g, ' ').trim();
  
      const nicknameSpan = document.createElement('span');
      nicknameSpan.className = `
        mt-6 text-amber-50 text-2xl font-bold tracking-wide break-all text-center w-full pl-2
      `.replace(/\s+/g, ' ').trim();
      nicknameSpan.textContent = options.nickname;
  
      if (options.leftExtraContent) leftCol.appendChild(options.leftExtraContent);
      leftCol.appendChild(profileTitle);
      leftCol.appendChild(avatar);
      leftCol.appendChild(nicknameSpan);
  
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
  