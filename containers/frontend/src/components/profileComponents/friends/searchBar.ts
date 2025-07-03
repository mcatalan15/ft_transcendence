export class MatchTableComponent {
    private searchBar: HTMLTableElement;
  
    constructor(data: any) {
      this.data = data;
      this.searchBar = document.createElement('searchBar');
      this.searchBar.className = 'flex w-full justify-end items-end mt-4 -ml-4';
      this.render();
    }
  
    private render() {
      this.searchBar.innerHTML = `
      <div
      class="p-4 overflow-hidden w-[60px] h-[60px] hover:w-[270px] bg-lime-400 shadow-[2px_2px_20px_rgba(0,0,0,0.08)] rounded-full flex group items-center transition-all duration-300"
      >
        <div class="flex items-center justify-items-end-safe fill-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
          >
            <path
              d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          id="search-input"
          placeholder="Search friends..."
          class="outline-none text-[20px] bg-transparent w-full text-white font-normal px-4 border-0 focus:ring-0 placeholder:text-amber-50"
          style="min-width:0";
        />
      </div>
    </div>

      `;
    }
  
    getElement() {
      return this.searchBar;
    }
  }