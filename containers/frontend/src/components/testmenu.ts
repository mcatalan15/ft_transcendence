export class HeaderTest {
    private element: HTMLElement;

    constructor() {
        this.element = document.createElement('headerTest');
        this.element.className = 'fixed top-0 left-0 w-full bg-neutral-900 shadow-sm z-10';

        this.element.innerHTML= `
<nav class="bg-neutral-900 fixed w-full z-20 top-0 start-0 border-b border-amber-50">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
  <a href="/home" class="flex items-center space-x-3 rtl:space-x-reverse">
      <img src="/static/logo/pong.png" class="h-8" alt="Pong Logo">
  </a>
  <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
      <button type="button" class="text-amber-50 bg-neutral-800 hover:bg-neutral-700 font-medium rounded-lg text-sm px-4 py-2 text-center ">Log out</button>
  </div>
  <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
    <ul class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-neutral-900 rounded-lg bg-neutral-900 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-neutral-900 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
      <li>
        <a href="/profile" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm md:text-amber-50 md:p-0 aria-current="page">PROFILE</a>
      </li>
      <li>
        <a href="/pong" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-amber-400 md:hover:bg-transparent md:hover:text-amber-400 md:p-0 ">PONG</a>
      </li>
      <li>
        <a href="/friends" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-lime-400 md:hover:bg-transparent md:hover:text-lime-400 md:p-0 ">FRIENDS</a>
      </li>
      <li>
        <a href="/chat" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-cyan-400 md:hover:bg-transparent md:hover:text-cyan-400 md:p-0 ">CHAT</a>
      </li>
      <li>
        <a href="/statistics" class="block py-2 px-3 text-3xl text-amber-50 font-anatol rounded-sm hover:bg-pink-400 md:hover:bg-transparent md:hover:text-pink-400 md:p-0 ">STATISTICS</a>
      </li>
    </ul>
  </div>
  </div>
</nav>
`

}
public getElement(): HTMLElement {
    return this.element;
  }
}
