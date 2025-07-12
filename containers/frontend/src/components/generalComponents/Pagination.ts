/*interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}*/

export class Pagination {
  private element: HTMLElement;
  private props: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };

  constructor(props: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) {
    this.props = props;
    this.element = document.createElement('div');
    this.element.className = 'flex items-center gap-1 my-2 pagination-container';
    this.render();
  }

  update(currentPage: number, totalPages: number) {
    this.props = { ...this.props, currentPage, totalPages };
    this.render();
  }

  getElement() {
    return this.element;
  }

  private render() {
    const { currentPage, totalPages, onPageChange } = this.props;
    this.element.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = this.createGamingButton('< PREV', currentPage === 0, () => {
      onPageChange(currentPage - 1);
    });
    this.element.appendChild(prevBtn);

    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);
    if (currentPage <= 1) end = Math.min(4, totalPages - 1);
    if (currentPage >= totalPages - 2) start = Math.max(0, totalPages - 5);
    
    for (let i = start; i <= end; i++) {
      const pageBtn = this.createGamingPageButton((i + 1).toString(), i === currentPage, () => {
        onPageChange(i);
      });
      this.element.appendChild(pageBtn);
    }

    const nextBtn = this.createGamingButton('NEXT >', currentPage === totalPages - 1, () => {
      onPageChange(currentPage + 1);
    });
    this.element.appendChild(nextBtn);
  }

  private createGamingButton(text: string, disabled: boolean, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'py-2 px-4 transition-all duration-300';
    button.type = 'button';
    
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
      button.style.cursor = 'pointer';
      
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#FFFBEB';
        button.style.color = '#171717';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#FFFBEB';
      });

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        onClick();
      });
    }

    return button;
  }

  private createGamingPageButton(text: string, isActive: boolean, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'py-2 px-3 transition-all duration-300';
    button.type = 'button'; 
    
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
      button.style.cursor = 'pointer';
      
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#FFFBEB';
        button.style.color = '#171717';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#FFFBEB';
      });

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      });
    }

    return button;
  }
}