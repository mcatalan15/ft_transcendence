type MatchRow = {
    date: string;
    opponent: string;
    score: string;
    mode: string;
    contract: string;
  };

export class MatchTableComponent {
    private table: HTMLTableElement;
    private data: MatchRow[];
  
    constructor(data: MatchRow[]) {
      this.data = data;
      this.table = document.createElement('table');
      this.table.className = "min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden bg-neutral-900";
      this.render();
    }
  
    private render() {
      this.table.innerHTML = `
        <thead class="bg-neutral-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Opponent</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mode</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contract</th>
            </tr>
        </thead>
        <tbody class="bg-neutral-900 divide-y divide-gray-200">
          ${
            this.data.map(row => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200 font-medium">${row.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200">${row.opponent}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200">${row.score}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200">${row.mode}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200">${row.contract}</td>
              </tr>
            `).join('')
          }
        </tbody>
      `;
    }
  
    updateData(newData: MatchRow[]) {
      this.data = newData;
      this.render();
    }
  
    getElement() {
      return this.table;
    }
  }
