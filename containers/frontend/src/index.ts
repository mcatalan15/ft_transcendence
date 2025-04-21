const greeting = "If you can see this, Typescript has been compiled and loaded successfully!";
console.log(greeting);

document.addEventListener("DOMContentLoaded", () => {
  const el = document.createElement("h1");
  el.textContent = greeting;
  document.body.appendChild(el);
});
