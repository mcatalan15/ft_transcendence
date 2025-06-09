import { createHeader } from "./header";
import { translateDOM } from "../utils/translateDOM";

export function AppLayout(pageContent: HTMLElement): void {
  const app = document.getElementById("app")!;
  app.innerHTML = "";

  const header = createHeader();
  const main = document.createElement("main");
  main.className = "p-6";
  main.appendChild(pageContent);

  app.appendChild(header);
  app.appendChild(main);

  translateDOM();
}