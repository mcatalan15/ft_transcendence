export function bounceBall(bounceBtn: HTMLElement, animationLayer: HTMLElement, color: string = 'bg-amber-400', maxBalls: number = 70) {
  const balls: HTMLDivElement[] = [];
  bounceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = bounceBtn.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const ball = document.createElement('div');
    ball.className = `w-4 h-4 ${color} rounded-full absolute z-0 pointer-events-none`;
    ball.style.left = `${startX}px`;
    ball.style.top = `${startY}px`;

    animationLayer.appendChild(ball);

    let x = startX;
    let y = startY;
    let dx = (Math.random() - 0.5) * 6;
    let dy = (Math.random() - 0.5) * 6;

    const updatePosition = () => {
      const maxX = window.innerWidth - 16;
      const maxY = window.innerHeight - 16;

      x += dx;
      y += dy;

      if (x <= 0 || x >= maxX) dx = -dx;
      if (y <= 0 || y >= maxY) dy = -dy;

      ball.style.left = `${x}px`;
      ball.style.top = `${y}px`;

      requestAnimationFrame(updatePosition);
    };

    updatePosition();
    balls.push(ball);

    if (balls.length > maxBalls) {
      const oldest = balls.shift();
      if (oldest) animationLayer.removeChild(oldest);
    }
  });
}
