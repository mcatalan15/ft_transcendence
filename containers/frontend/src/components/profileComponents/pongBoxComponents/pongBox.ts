type PongBoxOptions = {
  avatarUrl: string;
  nickname: string;
  leftExtraContent?: HTMLElement;
  mainContent: HTMLElement;
  onArrowClick?: () => void; // Nueva opción para la flecha
};
  
export class PongBoxComponent {
  private pongBox: HTMLDivElement;

  constructor(options: PongBoxOptions) {
    this.pongBox = document.createElement('div');
    this.pongBox.className = `
      w-full max-w-[1800px] h-auto md:h-[750px]
      mx-auto bg-neutral-900 border-l-[8px] border-r-[8px] border-b-[8px] md:border-l-[16px] md:border-r-[16px] md:border-b-[16px] border-amber-50
      flex flex-col md:flex-row overflow-hidden shadow-xl
      min-h-[600px]
      relative
    `.replace(/\s+/g, ' ').trim();

    // Flecha a perfil (opcional)
    // Se insertará después del nickname, pegada a la esquina derecha (no absolute)
    let arrowBtn: HTMLButtonElement | null = null;
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
    }

    const leftCol = document.createElement('div');
    leftCol.className = `
      w-full md:w-1/3 flex flex-col items-center justify-center bg-neutral-900 pt-6 pb-10 px-4 h-full relative
    `.replace(/\s+/g, ' ').trim();

    // Contenedor para centrar avatar y nickname vertical y horizontalmente
    const centerBox = document.createElement('div');
    centerBox.className = 'flex flex-col items-center justify-center h-full';

    const avatar = document.createElement('img');
    avatar.src = options.avatarUrl;
    avatar.alt = 'Profile';
    avatar.className = `
      w-32 h-32 md:w-56 md:h-56 rounded-full border-4 border-amber-50 object-cover
      transition-all duration-300 mt-20 mb-2 mx-auto
    `.replace(/\s+/g, ' ').trim();

    const nicknameSpan = document.createElement('span');
    nicknameSpan.className = `
      mt-6 text-amber-50 text-2xl font-bold tracking-wide break-all text-center w-full pl-2
    `.replace(/\s+/g, ' ').trim();
    nicknameSpan.textContent = options.nickname;

    if (options.leftExtraContent) centerBox.appendChild(options.leftExtraContent);
    centerBox.appendChild(avatar);
    centerBox.appendChild(nicknameSpan);
    leftCol.appendChild(centerBox);
    // Flecha independiente, pegada abajo
    if (arrowRow) {
      arrowRow.style.position = 'absolute';
      arrowRow.style.left = '1rem'; // Más a la izquierda
      arrowRow.style.bottom = '1.5rem';
      leftCol.appendChild(arrowRow);
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
  