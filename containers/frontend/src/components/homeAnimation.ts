export function createHomeAnimation(): HTMLDivElement {
  const R = 40; 
  let x = 0, y = 0;
  let vx = 5, vy = 4;
  let animationStarted = false;
  let currentBlockIndex = 0;
  let ballStopped = false;
  let animationFinished = false;
  let animationId: number;

  interface Block {
    el: HTMLDivElement;
    x: number; 
    y: number;
    w: number; 
    h: number;
    label: string;
    route: string;
    revealed: boolean;
    textEl?: HTMLDivElement;
    hit: boolean;
  }
  
  let blocks: Block[] = [];

  // Conteneur principal
  const container = document.createElement('div');
  container.className = 'relative w-full h-full bg-white overflow-hidden';

  // La balle (initialement cachée)
  const ball = document.createElement('div');
  ball.className = 'absolute bg-black rounded-full opacity-0 transition-opacity duration-500 z-20 flex items-center justify-center shadow-lg';
  ball.style.width = `${2*R}px`;
  ball.style.height = `${2*R}px`;
  container.appendChild(ball);

  // Texte LOGOUT dans la balle (initialement caché)
  const logoutText = document.createElement('div');
  logoutText.className = 'text-white text-xl font-bold opacity-0 transition-opacity duration-500 cursor-pointer';
  logoutText.textContent = 'LOGOUT';
  logoutText.onclick = () => {
    if (animationFinished) {
      window.location.href = '/logout';
    }
  };
  ball.appendChild(logoutText);

  // Configuration des blocs : [label, route]
  const blockConfig: [string, string][] = [
    ['PONG', '/pong'],
    ['PROFIL', '/profil'],
    ['JUEGO2', '/juego2'],
    ['RANK', '/rank']
  ];

  function createImpactEffect(x: number, y: number, side: 'top' | 'bottom' | 'left' | 'right') {
    const effect = document.createElement('div');
    effect.className = 'absolute pointer-events-none z-30';
    
    // Particules d'impact
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute bg-yellow-400 rounded-full opacity-100';
      particle.style.width = '6px';
      particle.style.height = '6px';
      
      const angle = (i / 8) * Math.PI * 2;
      let dirX = Math.cos(angle);
      let dirY = Math.sin(angle);
      
      // Ajuster la direction selon le côté d'impact
      switch (side) {
        case 'top':
          dirY = Math.abs(dirY) * -1; // Vers le haut
          break;
        case 'bottom':
          dirY = Math.abs(dirY); // Vers le bas
          break;
        case 'left':
          dirX = Math.abs(dirX) * -1; // Vers la gauche
          break;
        case 'right':
          dirX = Math.abs(dirX); // Vers la droite
          break;
      }
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      effect.appendChild(particle);
      
      // Animation des particules
      const distance = 30 + Math.random() * 20;
      const duration = 600 + Math.random() * 200;
      
      particle.animate([
        { 
          transform: 'translate(0, 0) scale(1)', 
          opacity: '1' 
        },
        { 
          transform: `translate(${dirX * distance}px, ${dirY * distance}px) scale(0)`, 
          opacity: '0' 
        }
      ], {
        duration: duration,
        easing: 'ease-out'
      });
    }
    
    container.appendChild(effect);
    
    // Nettoyer l'effet après l'animation
    setTimeout(() => {
      effect.remove();
    }, 1000);
  }

  function init() {
    // Nettoie les anciens blocs
    blocks.forEach(b => b.el.remove());
    blocks = [];
    
    // Reset des variables
    animationStarted = false;
    currentBlockIndex = 0;
    ballStopped = false;
    animationFinished = false;
    if (animationId) cancelAnimationFrame(animationId);

    const Cw = container.clientWidth;
    const Ch = container.clientHeight;

    // S'assurer que le conteneur a une taille minimale
    if (Cw < 100 || Ch < 100) {
      setTimeout(() => init(), 100);
      return;
    }

    // Positions stratégiques des blocs pour créer un parcours logique
    const blockPositions = [
      { x: Cw * 0.05, y: Ch * 0.20 }, // PONG - premier rebond après le coin haut-gauche
      { x: Cw * 0.50, y: Ch * 0.20 }, // PROFIL - haut droite
      { x: Cw * 0.05, y: Ch * 0.75 }, // JUEGO2 - bas gauche
      { x: Cw * 0.80, y: Ch * 0.65 }, // RANK - avant le coin bas-droite
    ];

    const bw = 150;
    const bh = 80;

    blockConfig.forEach(([label, route], i) => {
      const pos = blockPositions[i];
      const bx = Math.max(20, Math.min(pos.x, Cw - bw - 20));
      const by = Math.max(20, Math.min(pos.y, Ch - bh - 20));
      
      // Bloc noir rectangulaire
      const blockEl = document.createElement('div');
      blockEl.className = 'absolute bg-black border-2 border-gray-800 z-10 cursor-pointer transition-all duration-300 shadow-md';
      blockEl.style.left = `${bx}px`;
      blockEl.style.top = `${by}px`;
      blockEl.style.width = `${bw}px`;
      blockEl.style.height = `${bh}px`;
      container.appendChild(blockEl);

      // Texte du bloc (initialement caché)
      const textEl = document.createElement('div');
      textEl.className = 'absolute inset-0 flex items-center justify-center text-white text-xl font-bold opacity-0 transition-opacity duration-500';
      textEl.textContent = label;
      blockEl.appendChild(textEl);

      // Gestionnaire de clic (actif seulement après l'animation)
      blockEl.onclick = (e) => {
        e.preventDefault();
        if (animationFinished) {
          window.location.href = route;
        }
      };

      // Effet hover (actif seulement après l'animation)
      blockEl.onmouseenter = () => {
        if (animationFinished) {
          blockEl.style.transform = 'scale(1.05)';
          blockEl.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        }
      };
      
      blockEl.onmouseleave = () => {
        if (animationFinished) {
          blockEl.style.transform = 'scale(1)';
          blockEl.style.boxShadow = 'none';
        }
      };

      blocks.push({ 
        el: blockEl, 
        x: bx, 
        y: by, 
        w: bw, 
        h: bh, 
        label,
        route,
        revealed: false,
        textEl,
        hit: false
      });
    });

    // Position initiale : coin haut-gauche
    x = 20;
    y = 20;
    
    // Démarrer l'animation
    setTimeout(() => {
      ball.style.opacity = '1';
      animationStarted = true;
      animate();
    }, 1000);
  }

  function checkCollision(ballX: number, ballY: number, block: Block): { collision: boolean, side?: 'top' | 'bottom' | 'left' | 'right', contactX?: number, contactY?: number } {
    // Vérifier si la balle touche le bloc
    const ballRight = ballX + 2*R;
    const ballBottom = ballY + 2*R;
    const ballLeft = ballX;
    const ballTop = ballY;
    
    const blockRight = block.x + block.w;
    const blockBottom = block.y + block.h;
    const blockLeft = block.x;
    const blockTop = block.y;
    
    // Pas de collision
    if (ballRight < blockLeft || ballLeft > blockRight || ballBottom < blockTop || ballTop > blockBottom) {
      return { collision: false };
    }
    
    // Calculer les overlaps pour déterminer le côté de collision
    const overlapLeft = ballRight - blockLeft;
    const overlapRight = blockRight - ballLeft;
    const overlapTop = ballBottom - blockTop;
    const overlapBottom = blockBottom - ballTop;
    
    // Trouver le plus petit overlap pour déterminer le côté
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    
    let side: 'top' | 'bottom' | 'left' | 'right';
    let contactX: number, contactY: number;
    
    if (minOverlap === overlapTop) {
      side = 'top';
      contactX = ballX + R;
      contactY = blockTop;
    } else if (minOverlap === overlapBottom) {
      side = 'bottom';
      contactX = ballX + R;
      contactY = blockBottom;
    } else if (minOverlap === overlapLeft) {
      side = 'left';
      contactX = blockLeft;
      contactY = ballY + R;
    } else {
      side = 'right';
      contactX = blockRight;
      contactY = ballY + R;
    }
    
    return { collision: true, side, contactX, contactY };
  }

  /*function animate() {
    if (!animationStarted || ballStopped) return;

    const Cw = container.clientWidth;
    const Ch = container.clientHeight;

    // Calculer la nouvelle position
    let newX = x + vx;
    let newY = y + vy;

    // Vérifier les rebonds sur les murs
    if (newX <= 0 || newX + 2*R >= Cw) {
      vx = -vx;
      newX = newX <= 0 ? 0 : Cw - 2*R;
    }
    if (newY <= 0 || newY + 2*R >= Ch) {
      vy = -vy;
      newY = newY <= 0 ? 0 : Ch - 2*R;
    }

    // Vérifier les collisions avec tous les blocs (pas seulement le prochain dans la séquence)
    let collisionDetected = false;
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const collisionResult = checkCollision(newX, newY, block);
      
      if (collisionResult.collision) {
        collisionDetected = true;
        
        // Si c'est le prochain bloc dans la séquence et qu'il n'a pas encore été touché
        if (i === currentBlockIndex && !block.revealed) {
          block.revealed = true;
          
          // Créer l'effet d'impact
          if (collisionResult.contactX && collisionResult.contactY && collisionResult.side) {
            createImpactEffect(collisionResult.contactX, collisionResult.contactY, collisionResult.side);
          }
          
          // Révéler le texte avec animation
          if (block.textEl) {
            setTimeout(() => {
              if (block.textEl) {
                block.textEl.style.opacity = '1';
                // Animation de pulse pour le bloc
                block.el.animate([
                  { transform: 'scale(1)', backgroundColor: '#000000' },
                  { transform: 'scale(1.1)', backgroundColor: '#1f2937' },
                  { transform: 'scale(1)', backgroundColor: '#000000' }
                ], {
                  duration: 400,
                  easing: 'ease-out'
                });
              }
            }, 200);
          }
          
          currentBlockIndex++;
          
          // Si tous les blocs sont touchés, aller au coin bas-droite
          if (currentBlockIndex >= blocks.length) {
            setTimeout(() => {
              moveToBottomRight(Cw, Ch);
            }, 1500);
          }
        }
        
        // Calculer le rebond en fonction du côté de collision
        switch (collisionResult.side) {
          case 'top':
          case 'bottom':
            vy = -vy;
            newY = collisionResult.side === 'top' ? block.y - 2*R - 2 : block.y + block.h + 2;
            break;
          case 'left':
          case 'right':
            vx = -vx;
            newX = collisionResult.side === 'left' ? block.x - 2*R - 2 : block.x + block.w + 2;
            break;
        }
        
        break; // Sortir de la boucle après la première collision
      }
    }

    // Mettre à jour la position
    x = Math.max(0, Math.min(newX, Cw - 2*R));
    y = Math.max(0, Math.min(newY, Ch - 2*R));

    // Mise à jour visuelle avec effet de mouvement
    ball.style.transform = `translate(${x}px, ${y}px)`;
    
    // Ajouter un léger effet de traînée
    ball.style.boxShadow = `${-vx}px ${-vy}px 10px rgba(0,0,0,0.3)`;

    if (!ballStopped) {
      animationId = requestAnimationFrame(animate);
    }
  }*/

  function animate() {
  if (!animationStarted || ballStopped) return;

  const Cw = container.clientWidth;
  const Ch = container.clientHeight;

  let dx = vx;
  let dy = vy;
  const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / (R / 2));

  for (let step = 0; step < steps; step++) {
    let newX = x + dx / steps;
    let newY = y + dy / steps;

    // Rebote en bordes
    if (newX <= 0 || newX + 2 * R >= Cw) {
      vx = -vx;
      newX = newX <= 0 ? 0 : Cw - 2 * R;
      dx = vx;
      dy = vy;
    }
    if (newY <= 0 || newY + 2 * R >= Ch) {
      vy = -vy;
      newY = newY <= 0 ? 0 : Ch - 2 * R;
      dx = vx;
      dy = vy;
    }

    // Colisiones con bloques
    let collisionDetected = false;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const collisionResult = checkCollision(newX, newY, block);
      if (collisionResult.collision) {
        collisionDetected = true;

        // --- AQUÍ: LÓGICA DE DESCUBRIMIENTO ---
        if (i === currentBlockIndex && !block.revealed) {
          block.revealed = true;

          // Efecto de impacto
          if (collisionResult.contactX && collisionResult.contactY && collisionResult.side) {
            createImpactEffect(collisionResult.contactX, collisionResult.contactY, collisionResult.side);
          }

          // Revela el texto del bloque
          if (block.textEl) {
            setTimeout(() => {
              if (block.textEl) {
                block.textEl.style.opacity = '1';
                block.el.animate([
                  { transform: 'scale(1)', backgroundColor: '#000000' },
                  { transform: 'scale(1.1)', backgroundColor: '#1f2937' },
                  { transform: 'scale(1)', backgroundColor: '#000000' }
                ], {
                  duration: 400,
                  easing: 'ease-out'
                });
              }
            }, 200);
          }

          currentBlockIndex++;

          // Si todos los bloques han sido tocados
          if (currentBlockIndex >= blocks.length) {
            setTimeout(() => {
              moveToBottomRight(Cw, Ch);
            }, 1500);
          }
        }
        // Rebote dependiendo del lado
        switch (collisionResult.side) {
          case 'top':
          case 'bottom':
            vy = -vy;
            break;
          case 'left':
          case 'right':
            vx = -vx;
            break;
        }
        dx = vx;
        dy = vy;
        break; // Detén subpasos tras colisión
      }
    }

    if (!collisionDetected) {
      x = Math.max(0, Math.min(newX, Cw - 2 * R));
      y = Math.max(0, Math.min(newY, Ch - 2 * R));
    } else {
      break;
    }
  }

  ball.style.transform = `translate(${x}px, ${y}px)`;
  ball.style.boxShadow = `${-vx}px ${-vy}px 10px rgba(0,0,0,0.3)`;

  if (!ballStopped) {
    animationId = requestAnimationFrame(animate);
  }
}

  

  function moveToBottomRight(Cw: number, Ch: number) {
    ballStopped = true;
    const targetX = Cw - 2*R - 30;
    const targetY = Ch - 2*R - 30;
    
    const moveToCorner = () => {
      const dx = targetX - x;
      const dy = targetY - y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance > 5) {
        x += (dx / distance) * 6;
        y += (dy / distance) * 6;
        ball.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(moveToCorner);
      } else {
        // Balle arrêtée au coin bas-droite
        x = targetX;
        y = targetY;
        ball.style.transform = `translate(${x}px, ${y}px)`;
        ball.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
        
        // Montrer LOGOUT dans la balle
        setTimeout(() => {
          logoutText.style.opacity = '1';
          animationFinished = true;
          
          // Activer l'interactivité des blocs
          blocks.forEach(block => {
            if (block.revealed) {
              block.el.style.cursor = 'pointer';
              block.el.classList.add('hover:scale-105');
            }
          });
        }, 500);
      }
    };
    
    moveToCorner();
  }

  // Gestion du redimensionnement
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      init();
    }, 300) as unknown as number;
  });

  // Initialisation avec attente de taille
  function waitForSize(elem: HTMLElement, callback: () => void) {
    let attempts = 0;
    const maxAttempts = 20;
    
    const check = () => {
      attempts++;
      if (elem.clientWidth > 0 && elem.clientHeight > 0) {
        callback();
      } else if (attempts < maxAttempts) {
        setTimeout(check, 100);
      } else {
        callback();
      }
    };
    check();
  }

  // Nettoyage
  container.addEventListener('remove', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });

  waitForSize(container, init);

  return container;
}