import { loadGames, GameHistory } from '../../utils/matchHistory/gameUtils';
import { MatchTableComponent } from '../profileComponents/history/table';
import { Pagination } from '../generalComponents/Pagination';
import i18n from '../../i18n';

export class HistoryContentRenderer {
  private container: HTMLElement;
  private currentPage: number = 0;
  private gamesPerPage: number = 8;
  private totalGames: number = 0;
  private totalPages: number = 1;
  private matchTableComponent: MatchTableComponent;
  private paginationComponent: Pagination | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.matchTableComponent = new MatchTableComponent([]);
  }

  render(): HTMLElement {
    const mainContent = document.createElement('div');
    mainContent.className = 'flex flex-col items-center w-full';
    mainContent.style.backgroundColor = '#171717';

    const historySection = this.createHistorySection();
    mainContent.appendChild(historySection);

    this.loadAndRenderGames();
    return mainContent;
  }

  private createHistorySection(): HTMLElement {
    const historyContainer = document.createElement('div');
    historyContainer.className = 'w-full flex flex-col items-center mt-8 px-4';

    const overlay = this.createHistoryOverlay();
    
    const tableSection = this.createTableSection();
    const paginationSection = this.createPaginationSection();
    
    overlay.appendChild(tableSection);
    overlay.appendChild(paginationSection);

    historyContainer.appendChild(overlay);
    return historyContainer;
  }

  private createHistoryOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'relative p-6 gap-6 flex flex-col items-center';
    
    overlay.style.backgroundColor = '#171717';
    //overlay.style.border = '3px solid #FFFBEB';
    overlay.style.borderRadius = '0px';
    overlay.style.width = '100%';
    overlay.style.maxWidth = '1000px';

    return overlay;
  }

  private createTableSection(): HTMLElement {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'w-full flex flex-col items-center gap-4';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'w-full flex justify-center min-h-[200px]';
    tableWrapper.appendChild(this.matchTableComponent.getElement());
    
    this.styleTable();
    tableContainer.appendChild(tableWrapper);

    return tableContainer;
  }

  private createPaginationSection(): HTMLElement {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'w-full flex justify-center mt-4';
    paginationContainer.id = 'pagination-container';

    return paginationContainer;
  }

  private styleTable(): void {
    const tableElement = this.matchTableComponent.getElement();
    
    const table = tableElement.querySelector('table');
    if (table) {
      table.style.fontFamily = '"Roboto Mono", monospace';
      table.style.fontSize = '14px';
      table.style.color = '#FFFBEB';
      
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        header.style.backgroundColor = '#FFFBEB';
        header.style.color = '#171717';
        header.style.fontWeight = 'bold';
        header.style.textTransform = 'uppercase';
        header.style.padding = '12px';
        header.style.borderBottom = '2px solid #FFFBEB';
      });

      const rows = table.querySelectorAll('tr:not(:first-child)');
      rows.forEach((row, index) => {
        row.style.borderBottom = '1px solid #FFFBEB33';
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
          cell.style.padding = '12px';
          cell.style.color = '#FFFBEB';
        });
      });
    }
  }

  private async loadAndRenderGames(): Promise<void> {
    try {
      const { games, totalGames: total } = await loadGames(this.currentPage, this.gamesPerPage);
      
      this.totalGames = total;
      this.totalPages = Math.max(1, Math.ceil(this.totalGames / this.gamesPerPage));

      this.updatePagination();
      this.updateTable(games);
      
    } catch (error) {
      console.error('Error loading games:', error);
      this.matchTableComponent.updateData([]);
    }
  }

  private updatePagination(): void {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    if (!this.paginationComponent) {
      this.paginationComponent = new Pagination({
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        onPageChange: (page: number) => {
          this.currentPage = page;
          this.loadAndRenderGames();
        },
      });
    } else {
      this.paginationComponent.update(this.currentPage, this.totalPages);
    }

    paginationContainer.innerHTML = '';
    if (this.totalPages > 1) {
      paginationContainer.appendChild(this.paginationComponent.getElement());
    }
  }

  private updateTable(games: GameHistory[]): void {
    if (games.length === 0) {
      this.matchTableComponent.updateData([]);
      return;
    }

    const currentUser = sessionStorage.getItem('username') || '';
    const matchRows = games.map((game) => ({
      date: new Date(game.created_at).toLocaleString(),
      opponent: game.player1_name === currentUser ? game.player2_name : game.player1_name,
      score: `${game.player1_score} - ${game.player2_score}`,
      mode: game.game_mode || 'Classic',
      contract: game.smart_contract_link
        ? `<a href="${game.smart_contract_link}" target="_blank" class="text-amber-50 hover:text-amber-200 underline">View</a>`
        : '-',
    }));
    
    this.matchTableComponent.updateData(matchRows);
    this.styleTable();
  }
}