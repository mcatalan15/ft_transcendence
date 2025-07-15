export function bounceBall(bounceBtn: HTMLElement, animationLayer: HTMLElement, color: string = 'bg-amber-400', maxBalls: number = 70, confineToContainer: boolean = false) {
  const balls: HTMLDivElement[] = [];
  bounceBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const btnRect = bounceBtn.getBoundingClientRect();
    const containerRect = animationLayer.getBoundingClientRect();
    
    const startX = confineToContainer 
      ? btnRect.left + btnRect.width / 2 - containerRect.left 
      : btnRect.left + btnRect.width / 2;
    const startY = confineToContainer 
      ? btnRect.top + btnRect.height / 2 - containerRect.top 
      : btnRect.top + btnRect.height / 2;

    const ball = document.createElement('div');
    ball.className = `w-4 h-4 ${color} rounded-full absolute z-0 pointer-events-none`;
    
    if (confineToContainer) {
      ball.style.left = `${startX}px`;
      ball.style.top = `${startY}px`;
    } else {
      ball.style.left = `${btnRect.left + btnRect.width / 2}px`;
      ball.style.top = `${btnRect.top + btnRect.height / 2}px`;
    }

    animationLayer.appendChild(ball);

    let x = startX;
    let y = startY;
    let dx = (Math.random() - 0.5) * 6;
    let dy = (Math.random() - 0.5) * 6;

    const updatePosition = () => {
      const maxX = confineToContainer ? containerRect.width - 16 : window.innerWidth - 16;
      const maxY = confineToContainer ? containerRect.height - 16 : window.innerHeight - 16;

      x += dx;
      y += dy;

      if (x <= 0 || x >= maxX) {
        dx = -dx;
        x = x <= 0 ? 0 : maxX;
      }
      
      if (y <= 0 || y >= maxY) {
        dy = -dy;
        y = y <= 0 ? 0 : maxY;
      }

      ball.style.left = confineToContainer ? `${x}px` : `${x}px`;
      ball.style.top = confineToContainer ? `${y}px` : `${y}px`;

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