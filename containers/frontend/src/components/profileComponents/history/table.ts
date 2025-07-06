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
    this.table.className = "min-w-full divide-y divide-gray-200 overflow-hidden";
    this.table.style.fontFamily = '"Roboto Mono", monospace';
    this.table.style.backgroundColor = '#171717';
    this.table.style.borderRadius = '0px';
    this.render();
  }

  private render() {
    this.table.innerHTML = `
      <thead style="background-color: #171717;">
        <tr>
          <th style="
            padding: 12px 24px; 
            text-align: left; 
            font-family: 'Roboto Mono', monospace;
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            background-color: #FFFBEB;
            color: #171717;
            border-bottom: 2px solid #FFFBEB;
            border-radius: 0px;
          ">Date</th>
          <th style="
            padding: 12px 24px; 
            text-align: left; 
            font-family: 'Roboto Mono', monospace;
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            background-color: #FFFBEB;
            color: #171717;
            border-bottom: 2px solid #FFFBEB;
            border-radius: 0px;
          ">Opponent</th>
          <th style="
            padding: 12px 24px; 
            text-align: left; 
            font-family: 'Roboto Mono', monospace;
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            background-color: #FFFBEB;
            color: #171717;
            border-bottom: 2px solid #FFFBEB;
            border-radius: 0px;
          ">Score</th>
          <th style="
            padding: 12px 24px; 
            text-align: left; 
            font-family: 'Roboto Mono', monospace;
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            background-color: #FFFBEB;
            color: #171717;
            border-bottom: 2px solid #FFFBEB;
            border-radius: 0px;
          ">Mode</th>
          <th style="
            padding: 12px 24px; 
            text-align: left; 
            font-family: 'Roboto Mono', monospace;
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            background-color: #FFFBEB;
            color: #171717;
            border-bottom: 2px solid #FFFBEB;
            border-radius: 0px;
          ">Contract</th>
        </tr>
      </thead>
      <tbody style="background-color: #171717;">
        ${
          this.data.map(row => `
            <tr style="border-bottom: 1px solid rgba(255, 251, 235, 0.2);">
              <td style="
                padding: 12px 24px; 
                white-space: nowrap; 
                color: #FFFBEB; 
                font-family: 'Roboto Mono', monospace;
                font-size: 14px;
                font-weight: normal;
                border-radius: 0px;
              ">${row.date}</td>
              <td style="
                padding: 12px 24px; 
                white-space: nowrap; 
                color: #FFFBEB; 
                font-family: 'Roboto Mono', monospace;
                font-size: 14px;
                font-weight: normal;
                border-radius: 0px;
              ">${row.opponent}</td>
              <td style="
                padding: 12px 24px; 
                white-space: nowrap; 
                color: #FFFBEB; 
                font-family: 'Roboto Mono', monospace;
                font-size: 14px;
                font-weight: bold;
                border-radius: 0px;
              ">${row.score}</td>
              <td style="
                padding: 12px 24px; 
                white-space: nowrap; 
                color: #FFFBEB; 
                font-family: 'Roboto Mono', monospace;
                font-size: 14px;
                font-weight: normal;
                opacity: 0.8;
                border-radius: 0px;
              ">${row.mode}</td>
              <td style="
                padding: 12px 24px; 
                white-space: nowrap; 
                color: #FFFBEB; 
                font-family: 'Roboto Mono', monospace;
                font-size: 14px;
                font-weight: normal;
                border-radius: 0px;
              ">${row.contract}</td>
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