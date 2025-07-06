interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export class Pagination {
  private element: HTMLElement;
  private props: PaginationProps;

  constructor(props: PaginationProps) {
    this.props = props;
    this.element = document.createElement('div');
    this.element.className = 'flex justify-center items-center gap-2 py-4';
    this.render();
  }

  private render() {
    const { currentPage, totalPages, onPageChange } = this.props;
    this.element.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = this.createGamingButton('< PREV', currentPage === 0, () => onPageChange(currentPage - 1));
    this.element.appendChild(prevBtn);

    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);
    if (currentPage <= 1) end = Math.min(4, totalPages - 1);
    if (currentPage >= totalPages - 2) start = Math.max(0, totalPages - 5);
    
    for (let i = start; i <= end; i++) {
      const pageBtn = this.createGamingPageButton((i + 1).toString(), i === currentPage, () => onPageChange(i));
      this.element.appendChild(pageBtn);
    }

    const nextBtn = this.createGamingButton('NEXT >', currentPage === totalPages - 1, () => onPageChange(currentPage + 1));
    this.element.appendChild(nextBtn);
  }

  private createGamingButton(text: string, disabled: boolean, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'py-2 px-4 transition-all duration-300 cursor-pointer';
    
    button.style.backgroundColor = 'transparent';
    button.style.border = '2px solid #FFFBEB';
    button.style.color = '#FFFBEB';
    button.style.fontFamily = '"Roboto Mono", monospace';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '12px';
    button.style.textTransform = 'uppercase';
    button.style.borderRadius = '0px';
    
    if (disabled) {
      button.style.opacity = '0.3';
      button.style.cursor = 'not-allowed';
      button.disabled = true;
    } else {
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#FFFBEB';
        button.style.color = '#171717';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#FFFBEB';
      });

      button.onclick = onClick;
    }

    return button;
  }

  private createGamingPageButton(text: string, isActive: boolean, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'py-2 px-3 transition-all duration-300 cursor-pointer';
    
    button.style.fontFamily = '"Roboto Mono", monospace';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '12px';
    button.style.borderRadius = '0px';
    button.style.border = '2px solid #FFFBEB';
    
    if (isActive) {
      button.style.backgroundColor = '#FFFBEB';
      button.style.color = '#171717';
      button.disabled = true;
      button.style.cursor = 'default';
    } else {
      button.style.backgroundColor = 'transparent';
      button.style.color = '#FFFBEB';
      
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#FFFBEB';
        button.style.color = '#171717';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#FFFBEB';
      });

      button.onclick = onClick;
    }

    return button;
  }

  update(currentPage: number, totalPages: number) {
    this.props.currentPage = currentPage;
    this.props.totalPages = totalPages;
    this.render();
  }

  getElement() {
    return this.element;
  }
}