const ball = document.getElementById("ball") as HTMLElement;
const paddleTop = document.getElementById("paddleTop") as HTMLElement;
const paddleBottom = document.getElementById("paddleBottom") as HTMLElement;
const container = document.getElementById("zone") as HTMLElement;

let x = 100;
let y = 100;
let dx = 1;
let dy = 1;

let v = 1;
let position = 0;

const max = 230;

function moveBall() {
  x += dx;
  y += dy;

  if (x <= 0 || x >= max) dx = -dx;
  if (y <= 0 || y >= max) dy = -dy;

  ball.style.transform = `translate(265px, ${y}px)`;
}

function animatePaddles() {
  const paddleWidth = paddleTop.offsetWidth;
  const containerWidth = container.clientWidth;

  position += v;

  if (position <= 0) {
    position = 0;
    v = Math.abs(v);
  } else if (position + paddleWidth >= containerWidth) {
    position = containerWidth - paddleWidth;
    v = -Math.abs(v);
  }

  paddleTop.style.left = position + "px";
  paddleBottom.style.left = position + "px";

  requestAnimationFrame(animatePaddles);
}

setInterval(moveBall, 10);
requestAnimationFrame(animatePaddles);
