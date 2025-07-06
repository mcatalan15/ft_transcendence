export class AvatarComponent {
  private element: HTMLDivElement;

  constructor(avatarUrl: string, nickname: string) {
    this.element = document.createElement('div');
    this.element.className = 'flex flex-col items-center justify-center';

    const avatarFrame = document.createElement('div');
    avatarFrame.className = 'p-2 border border-4 border-amber-50 shadow-2xl bg-transparent w-full max-w-[500px] flex items-center justify-center';

    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.alt = 'Profile';
    avatar.className = `
      w-full aspect-square object-cover transition-all duration-300
      max-w-xs md:max-w-md
    `.replace(/\s+/g, ' ').trim();

    avatarFrame.appendChild(avatar);

    const nicknameSpan = document.createElement('span');
    nicknameSpan.className = `
      mt-4 text-amber-50 text-4xl font-anatol tracking-wide break-all text-center w-full max-w-[500px] pl-2
    `.replace(/\s+/g, ' ').trim();
    nicknameSpan.textContent = nickname;

    this.element.appendChild(avatarFrame);
    this.element.appendChild(nicknameSpan);
  }

  getElement() {
    return this.element;
  }
}
