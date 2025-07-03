// Pagination.ts
// Componente clásico de paginación: Anterior, 1 2 3 ... Siguiente

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

    // Botón Anterior
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.className = 'px-3 py-1 rounded bg-neutral-800 text-gray-200 hover:bg-neutral-700 disabled:opacity-50';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => onPageChange(currentPage - 1);
    this.element.appendChild(prevBtn);

    // Números de página
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);
    if (currentPage <= 1) end = Math.min(4, totalPages - 1);
    if (currentPage >= totalPages - 2) start = Math.max(0, totalPages - 5);
    for (let i = start; i <= end; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = (i + 1).toString();
      pageBtn.className =
        'px-3 py-1 rounded ' +
        (i === currentPage
          ? 'bg-amber-400 text-neutral-900 font-bold'
          : 'bg-neutral-800 text-gray-200 hover:bg-neutral-700');
      pageBtn.disabled = i === currentPage;
      pageBtn.onclick = () => onPageChange(i);
      this.element.appendChild(pageBtn);
    }

    // Botón Siguiente
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Siguiente';
    nextBtn.className = 'px-3 py-1 rounded bg-neutral-800 text-gray-200 hover:bg-neutral-700 disabled:opacity-50';
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.onclick = () => onPageChange(currentPage + 1);
    this.element.appendChild(nextBtn);
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
