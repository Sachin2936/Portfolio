/**
 * Mario-Style Platformer Game for Projects
 */

(function() {
  const canvas = document.getElementById('arcade-game');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // UI Elements
  const startScreen = document.getElementById('arcade-start-screen');
  const startBtn = document.getElementById('arcade-start-btn');
  const hud = document.getElementById('arcade-hud');
  const victoryScreen = document.getElementById('arcade-victory-screen');
  const scoreVal = document.getElementById('score-val');
  const revealedVal = document.getElementById('projects-revealed-val');
  const totalVal = document.getElementById('projects-total-val');
  
  // Project Cards
  const projectCards = document.querySelectorAll('.arcade-project-card');
  const totalProjects = projectCards.length;
  if (totalVal) totalVal.innerText = totalProjects;

  let width, height;
  let gameRunning = false;
  let lastTime = 0;
  let score = 0;
  let projectsRevealed = 0;

  // Physics & Engine
  const gravity = 0.6;
  const friction = 0.8;
  const floorHeight = 100;

  // Game Entities
  let player = {
    x: 0, y: 0, width: 30, height: 40,
    vx: 0, vy: 0,
    speed: 5, jumpForce: -12,
    grounded: false,
    color: '#ff0000'
  };

  let blocks = [];
  let particles = [];
  let clouds = [];

  // Input
  let keys = {};

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    player.y = height - floorHeight - player.height;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  
  // Touch controls for mobile (tap left/right side of screen, tap top to jump)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      let tx = e.touches[i].clientX;
      let ty = e.touches[i].clientY;
      if (ty < height / 2 && player.grounded) {
        player.vy = player.jumpForce;
        player.grounded = false;
      } else if (tx < width / 2) {
        keys['ArrowLeft'] = true;
      } else {
        keys['ArrowRight'] = true;
      }
    }
  }, {passive: false});

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
  }, {passive: false});

  startBtn.addEventListener('click', startGame);

  function startGame() {
    startScreen.style.display = 'none';
    hud.style.display = 'flex';
    gameRunning = true;
    score = 0;
    projectsRevealed = 0;
    scoreVal.innerText = score;
    revealedVal.innerText = projectsRevealed;
    
    // Reset Entities
    blocks = [];
    particles = [];
    player.x = 50;
    player.y = height - floorHeight - player.height;
    player.vx = 0;
    player.vy = 0;

    // Spawn Blocks (one for each project)
    const blockSpacing = (width - 200) / totalProjects;
    for (let i = 0; i < totalProjects; i++) {
      blocks.push({
        x: 100 + i * blockSpacing,
        y: height - floorHeight - 120 - Math.random() * 80, // varying heights
        width: 40,
        height: 40,
        projectIndex: i,
        hit: false,
        animY: 0
      });
    }

    // Init Clouds
    clouds = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * width,
        y: Math.random() * (height / 2),
        width: 60 + Math.random() * 60,
        height: 30 + Math.random() * 20,
        speed: 0.2 + Math.random() * 0.5
      });
    }

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }

  function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color: color
      });
    }
  }

  function checkCollision(r1, r2) {
    return (r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y);
  }

  function update(dt) {
    if (!gameRunning) return;

    // Input
    if (keys['ArrowLeft'] || keys['KeyA']) {
      player.vx -= 1;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
      player.vx += 1;
    }
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.grounded) {
      player.vy = player.jumpForce;
      player.grounded = false;
    }

    // Apply physics
    player.vx *= friction;
    player.vy += gravity;

    // Limit speed
    if (player.vx > player.speed) player.vx = player.speed;
    if (player.vx < -player.speed) player.vx = -player.speed;

    // Previous position for collision resolution
    let prevX = player.x;
    let prevY = player.y;

    player.x += player.vx;
    player.y += player.vy;

    // Screen bounds
    if (player.x < 0) { player.x = 0; player.vx = 0; }
    if (player.x > width - player.width) { player.x = width - player.width; player.vx = 0; }

    // Floor collision
    player.grounded = false;
    if (player.y >= height - floorHeight - player.height) {
      player.y = height - floorHeight - player.height;
      player.vy = 0;
      player.grounded = true;
    }

    // Block collisions
    for (let i = 0; i < blocks.length; i++) {
      let b = blocks[i];
      
      // Animate block if hit
      if (b.animY < 0) b.animY += 1;

      if (checkCollision(player, {x: b.x, y: b.y + b.animY, width: b.width, height: b.height})) {
        
        // Coming from above (Landing)
        if (prevY + player.height <= b.y && player.vy > 0) {
          player.y = b.y - player.height;
          player.vy = 0;
          player.grounded = true;
        }
        // Coming from below (Hitting the block)
        else if (prevY >= b.y + b.height && player.vy < 0) {
          player.y = b.y + b.height;
          player.vy = 0;
          
          if (!b.hit) {
            b.hit = true;
            b.animY = -10; // Bounce block up
            createParticles(b.x + b.width/2, b.y, '#ffff00');
            unlockProject(b.projectIndex);
            score += 500;
            scoreVal.innerText = score;
          }
        }
        // Coming from the left
        else if (prevX + player.width <= b.x) {
          player.x = b.x - player.width;
          player.vx = 0;
        }
        // Coming from the right
        else if (prevX >= b.x + b.width) {
          player.x = b.x + b.width;
          player.vx = 0;
        }
      }
    }

    // Clouds
    clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > width) c.x = -c.width;
    });

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity * 0.5;
      p.life -= 0.02;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function unlockProject(index) {
    if (projectCards[index]) {
      projectCards[index].classList.remove('locked');
      projectsRevealed++;
      revealedVal.innerText = projectsRevealed;
      
      if (projectsRevealed >= totalProjects) {
        setTimeout(() => {
          gameRunning = false;
          victoryScreen.style.display = 'block';
          // Hide it after 3 seconds so it doesn't overlap
          setTimeout(() => {
            victoryScreen.style.display = 'none';
          }, 3000);
        }, 1500);
      }
    }
  }

  function draw() {
    // Sky background
    ctx.fillStyle = '#5c94fc'; // Classic Mario sky blue
    ctx.fillRect(0, 0, width, height);

    // Draw Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.height/2, Math.PI/2, Math.PI*1.5);
      ctx.arc(c.x + c.width/2, c.y - c.height/4, c.height/1.5, Math.PI, 0);
      ctx.arc(c.x + c.width, c.y, c.height/2, -Math.PI/2, Math.PI/2);
      ctx.fill();
    });

    if (!gameRunning && projectsRevealed < totalProjects) return;

    // Draw Floor
    ctx.fillStyle = '#c84c0c'; // Brick red/brown
    ctx.fillRect(0, height - floorHeight, width, floorHeight);
    // Floor top edge
    ctx.fillStyle = '#00a800'; // Grass green
    ctx.fillRect(0, height - floorHeight, width, 20);

    // Draw Blocks
    blocks.forEach(b => {
      ctx.fillStyle = b.hit ? '#8b4513' : '#ffd700'; // Brown if hit, gold if not
      let drawY = b.y + b.animY;
      
      ctx.fillRect(b.x, drawY, b.width, b.height);
      
      // Block border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, drawY, b.width, b.height);

      if (!b.hit) {
        ctx.fillStyle = '#000';
        ctx.font = '24px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', b.x + b.width/2, drawY + b.height/2);
      }
    });

    // Draw Player (Mario-ish)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player "hat" / details
    ctx.fillStyle = '#0000ff'; // Blue overalls
    ctx.fillRect(player.x, player.y + 20, player.width, 20);
    
    // Eyes
    ctx.fillStyle = '#fff';
    let dir = player.vx > 0 ? 1 : (player.vx < 0 ? -1 : 1); // Simple facing dir
    let eyeX = player.x + (dir === 1 ? 20 : 5);
    ctx.fillRect(eyeX, player.y + 5, 5, 5);

    // Draw Particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;
  }

  function gameLoop(time) {
    let dt = time - lastTime;
    lastTime = time;
    
    if (dt > 100) dt = 100; // Cap
    
    update(dt);
    draw();
    
    if (gameRunning || particles.length > 0 || !gameRunning) {
      requestAnimationFrame(gameLoop);
    }
  }

})();
