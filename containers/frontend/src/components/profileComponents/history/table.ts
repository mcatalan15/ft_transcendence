type MatchRow = {
    song: string;
    artist: string;
    year: number;
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Song</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Artist</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Year</th>
          </tr>
        </thead>
        <tbody class="bg-neutral-900 divide-y divide-gray-200">
          ${
            this.data.map(row => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200 font-medium">${row.song}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200">${row.artist}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-200">${row.year}</td>
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
