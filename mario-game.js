/**
 * GOTHAM RUNNER — Cinematic Cyberpunk Platformer
 * Fixed: player screen-space coords, prevent scroll on keys
 */
(function () {
  'use strict';

  const canvas = document.getElementById('arcade-game');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── UI references ── */
  const startScreen = document.getElementById('arcade-start-screen');
  const startBtn = document.getElementById('arcade-start-btn');
  const recruiterBtn = document.getElementById('arcade-recruiter-btn');
  const hud = document.getElementById('arcade-hud');
  const victoryScreen = document.getElementById('arcade-victory-screen');
  const scoreVal = document.getElementById('score-val');
  const revealedVal = document.getElementById('projects-revealed-val');
  const totalVal = document.getElementById('projects-total-val');

  const projectCards = document.querySelectorAll('.hud-panel');
  const totalProjects = projectCards.length || 3;
  if (totalVal) totalVal.innerText = totalProjects;

  /* ── Centered Decrypted Modal References & Data ── */
  const modalEl = document.getElementById('project-decryption-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalFileId = document.getElementById('modal-file-id');
  const modalName = document.getElementById('modal-name');
  const modalDesc = document.getElementById('modal-desc');
  const modalTags = document.getElementById('modal-tags');
  const modalLink = document.getElementById('modal-link');

  let modalOpen = false;

  const PROJECTS_DATA = [
    {
      fileId: 'FILE_01',
      name: 'TypeNews',
      desc: 'TypeNews is a live, high-performance news aggregator and custom real-time typing engine built to deliver the latest global news in an interactive, typing-based reader console. Read updates while reinforcing your typing speed and precision.',
      tags: ['Next.js', 'Tailwind CSS', 'News API'],
      link: 'https://typenews.in/'
    },
    {
      fileId: 'FILE_02',
      name: 'Algorithm Visualizer',
      desc: 'An interactive, high-fidelity canvas simulation engine rendering real-time sorting, pathfinding, and cryptographic algorithms with dynamic step-execution speed controls.',
      tags: ['JavaScript', 'Canvas API', 'Algorithms'],
      link: '#'
    },
    {
      fileId: 'FILE_03',
      name: 'Secure Auth System',
      desc: 'Enterprise-grade JWT authentication and session gateway containerized with Docker, featuring Redis caching, rate limiting, and PostgreSQL relational schemas.',
      tags: ['Node.js', 'Redis', 'Docker'],
      link: '#'
    }
  ];

  /* ── Dimensions ── */
  let W = 0, H = 0;

  function resize() {
    const rect = canvas.parentElement
      ? canvas.parentElement.getBoundingClientRect()
      : { width: window.innerWidth, height: window.innerHeight };
    W = canvas.width = rect.width || window.innerWidth;
    H = canvas.height = rect.height || window.innerHeight;
    if (H < 400) H = canvas.height = 500;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Constants ── */
  const GRAVITY = 0.55;
  const FRICTION = 0.80;
  const FLOOR_H = 80;
  const WORLD_W = 3000;  // world width for scrolling blocks

  /* ── State ── */
  let gameRunning = false;
  let score = 0;
  let projectsDone = 0;
  let cameraX = 0;   // world units scrolled (affects background/blocks only)
  let lastTime = 0;
  let cardUnlockingTriggered = {};

  /* ── Player — coordinates are SCREEN SPACE ── */
  const player = {
    x: 80, y: 0,         // screen pixels
    w: 36, h: 52,
    vx: 0, vy: 0,
    speed: 6,
    jumpForce: -14,
    grounded: false,
    facing: 1,
    frame: 0, frameTimer: 0,
    jumpArc: 0,
    trail: [],
  };

  /* ── Entities in WORLD SPACE (draw at worldX - cameraX) ── */
  let blocks = [];
  let particles = [];   // particles in SCREEN SPACE
  let stars = [];
  let buildings = [];
  let lightningTimer = 0;
  let lightning = null;

  /* ── Input — prevent page scroll while game focused ── */
  const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD']);
  const keys = {};

  function onKeyDown(e) {
    keys[e.code] = true;
    if (gameRunning && GAME_KEYS.has(e.code)) {
      e.preventDefault();   // ← stops page from scrolling
      e.stopPropagation();
    }
  }
  function onKeyUp(e) { keys[e.code] = false; }

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);

  /* ── Touch ── */
  let touchLeft = false, touchRight = false;
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.clientY < H * 0.55) {
        if (player.grounded) { player.vy = player.jumpForce; player.grounded = false; spawnJumpDust(); }
      } else if (t.clientX < W / 2) touchLeft = true;
      else touchRight = true;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    touchLeft = touchRight = false;
  }, { passive: false });

  /* ──────────────── BUILD WORLD ──────────────── */
  function buildWorld() {
    blocks = [];
    particles = [];
    cameraX = 0;

    /* Background buildings (world space) */
    buildings = [];
    for (let i = 0; i < 50; i++) {
      buildings.push({
        x: Math.random() * (WORLD_W + W),
        y: 0,
        w: 30 + Math.random() * 90,
        h: 80 + Math.random() * 320,
        layer: Math.floor(Math.random() * 3),
      });
    }
    buildings.sort((a, b) => a.layer - b.layer);

    /* Stars (world space x, but very slow parallax) */
    stars = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random() * (WORLD_W + W),
        y: 20 + Math.random() * (H * 0.6),
        r: Math.random() * 1.5 + 0.3,
        blink: Math.random() * Math.PI * 2,
      });
    }

    /* Mystery blocks — one per project, placed in world space */
    const spacing = (WORLD_W - 300) / totalProjects;
    for (let i = 0; i < totalProjects; i++) {
      blocks.push({
        worldX: 220 + i * spacing + Math.random() * 40,
        y: H - FLOOR_H - 165 - Math.random() * 60,
        w: 52, h: 52,
        projectIndex: i,
        hit: false,
        animY: 0,
        glow: 0,
        pulseR: 0,
      });
    }

    lightningTimer = 60;
    lightning = null;
    cardUnlockingTriggered = {};
  }

  /* ──────────────── START GAME ──────────────── */
  function startGame() {
    startScreen.style.display = 'none';
    hud.style.display = 'flex';
    gameRunning = true;
    score = 0;
    projectsDone = 0;
    if (scoreVal) scoreVal.innerText = '000000';
    if (revealedVal) revealedVal.innerText = 0;

    player.x = 80;
    player.y = H - FLOOR_H - player.h;
    player.vx = player.vy = 0;
    player.grounded = false;
    player.trail = [];
    player.jumpArc = 0;

    buildWorld();
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  startBtn.addEventListener('click', startGame);

  if (recruiterBtn) {
    recruiterBtn.addEventListener('click', () => {
      startScreen.style.display = 'none';
      if (hud) hud.style.display = 'flex';

      // Initialize the entities/world state
      buildWorld();

      // Staggered reveal of all projects
      for (let i = 0; i < totalProjects; i++) {
        setTimeout(() => {
          const b = blocks[i];
          if (b) {
            b.hit = true;
            b.animY = -14;
            b.pulseR = 55;
            spawnBlockBurst(b.worldX - cameraX, b.y);
            shootHomingBeams(i, b.worldX - cameraX, b.y);
            addScore(1000);
          } else {
            unlockProject(i);
          }
        }, i * 300);
      }

      // Start the render loop so particles and block hit animation render beautifully
      if (!gameRunning) {
        gameRunning = true;
        player.x = 80;
        player.y = H - FLOOR_H - player.h;
        player.vx = player.vy = 0;
        player.grounded = true;
        lastTime = performance.now();
        requestAnimationFrame(loop);
      }
    });
  }

  /* ──────────────── UPDATE ──────────────── */
  function update(dt) {
    if (!gameRunning || modalOpen) return;

    const goLeft = keys['ArrowLeft'] || keys['KeyA'] || touchLeft;
    const goRight = keys['ArrowRight'] || keys['KeyD'] || touchRight;
    const doJump = keys['ArrowUp'] || keys['KeyW'] || keys['Space'];

    if (goLeft) { player.vx -= 1.4; player.facing = -1; }
    if (goRight) { player.vx += 1.4; player.facing = 1; }
    if (doJump && player.grounded) {
      player.vy = player.jumpForce;
      player.grounded = false;
      spawnJumpDust();
    }

    player.vx = Math.max(-player.speed, Math.min(player.speed, player.vx * FRICTION + (goLeft ? -1.4 : goRight ? 1.4 : 0)));
    // Actually recompute cleanly:
    player.vx *= FRICTION;
    if (goLeft) player.vx -= 0.8;
    if (goRight) player.vx += 0.8;
    player.vx = Math.max(-player.speed, Math.min(player.speed, player.vx));
    player.vy += GRAVITY;

    const prevX = player.x;
    const prevY = player.y;

    player.x += player.vx;
    player.y += player.vy;

    /* Screen horizontal bounds */
    player.x = Math.max(0, Math.min(W - player.w, player.x));

    /* Camera scroll — moves world when player reaches right 55% of screen */
    if (player.vx > 0 && player.x > W * 0.55) {
      cameraX += player.vx;
      player.x = W * 0.55;
      cameraX = Math.min(cameraX, WORLD_W);
    }
    /* Allow scrolling back left */
    if (player.vx < 0 && player.x < W * 0.25 && cameraX > 0) {
      cameraX += player.vx;
      player.x = W * 0.25;
      cameraX = Math.max(0, cameraX);
    }

    /* Floor */
    player.grounded = false;
    if (player.y + player.h >= H - FLOOR_H) {
      player.y = H - FLOOR_H - player.h;
      player.vy = 0;
      player.grounded = true;
    }

    /* Jump arc for cape */
    if (!player.grounded) player.jumpArc += 0.1;
    else player.jumpArc = 0;

    /* Walk frame */
    if (player.grounded && Math.abs(player.vx) > 0.5) {
      if (++player.frameTimer > 6) { player.frame = (player.frame + 1) % 4; player.frameTimer = 0; }
    }

    /* Block collisions — blocks live in world space, convert to screen for collision */
    for (const b of blocks) {
      if (b.animY < 0) b.animY = Math.min(0, b.animY + 1.2);
      b.glow = (b.glow + 0.04) % (Math.PI * 2);
      if (b.pulseR > 0) b.pulseR *= 0.88;

      const bScreenX = b.worldX - cameraX;  // block's screen X
      const bY = b.y + b.animY;

      /* Skip if off-screen */
      if (bScreenX + b.w < 0 || bScreenX > W) continue;

      const overlap =
        player.x < bScreenX + b.w &&
        player.x + player.w > bScreenX &&
        player.y < bY + b.h &&
        player.y + player.h > bY;

      if (!overlap) continue;

      const fromAbove = prevY + player.h <= bY + 4 && player.vy > 0;
      const fromBelow = prevY >= bY + b.h - 4 && player.vy < 0;
      const fromLeft = prevX + player.w <= bScreenX + 6;
      const fromRight = prevX >= bScreenX + b.w - 6;

      if (fromAbove) {
        player.y = bY - player.h;
        player.vy = 0;
        player.grounded = true;
      } else if (fromBelow && !b.hit) {
        player.y = bY + b.h;
        player.vy = Math.abs(player.vy) * 0.2;
        b.hit = true;
        b.animY = -14;
        b.pulseR = 55;
        spawnBlockBurst(bScreenX + b.w / 2, bY);
        addScore(1000);
        shootHomingBeams(b.projectIndex, bScreenX + b.w / 2, bY);
      } else if (fromLeft) {
        player.x = bScreenX - player.w;
        player.vx = 0;
      } else if (fromRight) {
        player.x = bScreenX + b.w;
        player.vx = 0;
      }
    }

    /* Trail — screen space */
    player.trail.unshift({ x: player.x + player.w / 2, y: player.y + player.h / 2, life: 1 });
    if (player.trail.length > 9) player.trail.pop();
    player.trail.forEach(t => t.life -= 0.12);

    /* Particles — screen space */
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.isHoming) {
        // Direct physics steering towards card target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 15) {
          // Reached target! Trigger decryption explosion
          particles.splice(i, 1);
          triggerCardDecryption(p.projectIndex, p.targetX, p.targetY);
          continue;
        }

        // Dynamic steering forces
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * 1.8;
        p.vy += Math.sin(angle) * 1.8;

        // Speed cap
        const spd = Math.hypot(p.vx, p.vy);
        const maxSpd = 18;
        if (spd > maxSpd) {
          p.vx = (p.vx / spd) * maxSpd;
          p.vy = (p.vy / spd) * maxSpd;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Spark trail ribbon points
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) p.trail.shift();
      } else {
        p.x += p.vx; p.y += p.vy;
        p.vy += GRAVITY * 0.35;
        p.vx *= 0.97;
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    /* Lightning */
    lightningTimer--;
    if (lightningTimer <= 0) {
      lightningTimer = 160 + Math.random() * 280;
      lightning = { life: 1, x: 60 + Math.random() * (W - 120) };
    }
    if (lightning) { lightning.life -= 0.09; if (lightning.life <= 0) lightning = null; }

    stars.forEach(s => s.blink += 0.035);
  }

  /* ──────────────── DRAW ──────────────── */
  function draw() {
    /* Sky */
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#010208');
    skyGrad.addColorStop(0.7, '#080e28');
    skyGrad.addColorStop(1, '#060a1c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    /* Lightning flash */
    if (lightning && lightning.life > 0) {
      ctx.fillStyle = `rgba(160,200,255,${lightning.life * 0.07})`;
      ctx.fillRect(0, 0, W, H);
      drawLightning(lightning.x, 0, lightning.x + (Math.random() - 0.5) * 50, H * 0.58, lightning.life);
    }

    /* Stars — very slow parallax */
    stars.forEach(s => {
      const sx = (s.x - cameraX * 0.04 + W * 10) % (WORLD_W + W);  // wrap
      if (sx < 0 || sx > W) return;
      const alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.blink));
      ctx.beginPath();
      ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.fill();
    });

    /* Parallax buildings */
    buildings.forEach(b => {
      const parallax = [0.12, 0.32, 0.62][b.layer];
      const sx = b.x - cameraX * parallax;
      /* Tile infinitely */
      const tx = ((sx % (WORLD_W + W)) + WORLD_W + W) % (WORLD_W + W) - W * 0.1;
      if (tx > W + 100 || tx + b.w < -10) return;

      const buildH = b.h;
      const buildY = H - FLOOR_H - buildH;
      const alpha = [0.22, 0.42, 0.68][b.layer];
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ['#050b1e', '#080e24', '#0c1432'][b.layer];
      ctx.fillRect(tx, buildY, b.w, buildH);
      ctx.globalAlpha = 1;

      /* Window lights */
      const cols = Math.floor(b.w / 11);
      const rows = Math.floor(buildH / 15);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const seed = (r * 13 + c * 7 + b.layer * 31) % 9;
          if (seed < 3) {
            const wColors = ['#ffe60028', '#00f5ff1a', '#ff00ff16', '#ffffff14'];
            ctx.fillStyle = wColors[seed % wColors.length];
            ctx.fillRect(tx + c * 11 + 2, buildY + r * 15 + 4, 6, 5);
          }
        }
      }

      /* Blinking antenna on near buildings */
      if (b.layer === 2) {
        const blink = Math.sin(Date.now() * 0.003 + b.x) > 0;
        ctx.fillStyle = blink ? '#ff0033cc' : '#22000866';
        ctx.beginPath();
        ctx.arc(tx + b.w / 2, buildY - 12, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    /* Floor */
    const floorY = H - FLOOR_H;
    const gGrad = ctx.createLinearGradient(0, floorY, 0, H);
    gGrad.addColorStop(0, '#0d1b3e');
    gGrad.addColorStop(1, '#050c1a');
    ctx.fillStyle = gGrad;
    ctx.fillRect(0, floorY, W, FLOOR_H);

    /* Neon edge stripe */
    ctx.fillStyle = '#00f5ff';
    ctx.shadowBlur = 14; ctx.shadowColor = '#00f5ff';
    ctx.fillRect(0, floorY, W, 2.5);
    ctx.shadowBlur = 0;

    /* Floor grid */
    ctx.strokeStyle = 'rgba(0,245,255,0.05)';
    ctx.lineWidth = 1;
    const gapX = 56;
    const offsetX = (-cameraX * 0.8) % gapX;
    for (let gx = offsetX; gx < W; gx += gapX) {
      ctx.beginPath(); ctx.moveTo(gx, floorY); ctx.lineTo(gx - 20, H); ctx.stroke();
    }
    for (let gy = 0; gy < FLOOR_H; gy += 18) {
      ctx.beginPath(); ctx.moveTo(0, floorY + gy); ctx.lineTo(W, floorY + gy); ctx.stroke();
    }

    /* Mystery blocks */
    blocks.forEach(b => {
      const bScreenX = b.worldX - cameraX;
      const bY = b.y + b.animY;
      if (bScreenX + b.w < -20 || bScreenX > W + 20) return;

      /* Pulse ring */
      if (b.pulseR > 2) {
        ctx.beginPath();
        ctx.arc(bScreenX + b.w / 2, bY + b.h / 2, b.pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,230,0,${b.pulseR / 55 * 0.5})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 18; ctx.shadowColor = '#ffe600';
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      /* Block body */
      const glowAmt = b.hit ? 0 : 6 + 5 * Math.sin(b.glow);
      ctx.shadowBlur = glowAmt; ctx.shadowColor = '#7B2FFF';
      const bg = ctx.createLinearGradient(bScreenX, bY, bScreenX + b.w, bY + b.h);
      bg.addColorStop(0, b.hit ? '#181828' : '#2d1a6e');
      bg.addColorStop(1, b.hit ? '#0f0f1f' : '#1c1040');
      ctx.fillStyle = bg;
      roundRect(ctx, bScreenX, bY, b.w, b.h, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = b.hit ? '#2a2a3a' : '#5533cc';
      ctx.lineWidth = 1.5;
      roundRect(ctx, bScreenX, bY, b.w, b.h, 8);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (!b.hit) {
        ctx.fillStyle = '#ffe600';
        ctx.shadowBlur = 10; ctx.shadowColor = '#ffe600';
        ctx.font = `bold 22px 'Orbitron', monospace`;
        ctx.fillText('?', bScreenX + b.w / 2, bY + b.h / 2);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#3a3a5c';
        ctx.font = `bold 18px 'Orbitron', monospace`;
        ctx.fillText('✓', bScreenX + b.w / 2, bY + b.h / 2);
      }
    });

    /* Player motion trail */
    player.trail.forEach(t => {
      if (t.life <= 0) return;
      ctx.beginPath();
      ctx.arc(t.x, t.y, player.w / 3 * t.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,255,${t.life * 0.25})`;
      ctx.fill();
    });

    /* Draw Batman at SCREEN position player.x, player.y */
    drawBatman(player.x, player.y, player.facing, player.grounded, player.vx);

    /* Particles */
    particles.forEach(p => {
      if (p.life <= 0 && !p.isHoming) return;
      ctx.save();
      ctx.globalAlpha = p.isHoming ? 1 : p.life;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.isHoming ? 18 : 7;
      ctx.shadowColor = p.color;

      if (p.isHoming && p.trail) {
        // Draw elegant glowing ribbon trail for homing energy sparks
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.r * 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (p.trail.length > 0) {
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let ti = 1; ti < p.trail.length; ti++) {
            ctx.lineTo(p.trail[ti].x, p.trail[ti].y);
          }
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  /* ──────────────── BATMAN SPRITE ──────────────── */
  function drawBatman(x, y, dir, grounded, vx) {
    ctx.save();
    ctx.translate(x + player.w / 2, y + player.h / 2);
    if (dir < 0) ctx.scale(-1, 1);

    const pw = player.w, ph = player.h;
    const capeWave = grounded
      ? Math.sin(Date.now() * 0.007) * 3
      : Math.sin(player.jumpArc) * 7;

    /* Cape */
    ctx.beginPath();
    ctx.moveTo(-4, -ph * 0.25);
    ctx.bezierCurveTo(-pw * 0.8 + capeWave, 0, -pw * 0.9 + capeWave * 0.5, ph * 0.38, -pw * 0.28, ph * 0.5);
    ctx.bezierCurveTo(-2, ph * 0.35, -2, ph * 0.1, -4, -ph * 0.25);
    ctx.fillStyle = '#0a0a1a';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-4, -ph * 0.2);
    ctx.bezierCurveTo(-pw * 0.5 + capeWave, -ph * 0.05, -pw * 0.45, ph * 0.18, -pw * 0.22, ph * 0.38);
    ctx.strokeStyle = 'rgba(100,120,200,0.28)';
    ctx.lineWidth = 1; ctx.stroke();

    /* Body */
    const bodyGrad = ctx.createLinearGradient(-pw / 2, -ph * 0.15, pw / 2, ph * 0.5);
    bodyGrad.addColorStop(0, '#1a1f35');
    bodyGrad.addColorStop(1, '#0c0e1a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, ph * 0.15, pw * 0.36, ph * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    /* Chest bat */
    ctx.fillStyle = '#ffe600';
    ctx.shadowBlur = 5; ctx.shadowColor = '#ffe600';
    ctx.font = '11px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🦇', 0, ph * 0.12);
    ctx.shadowBlur = 0;

    /* Head / cowl */
    ctx.fillStyle = '#0e1120';
    ctx.beginPath();
    ctx.ellipse(0, -ph * 0.28, pw * 0.27, ph * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    /* Ears */
    ctx.fillStyle = '#0e1120';
    ctx.beginPath();
    ctx.moveTo(-pw * 0.14, -ph * 0.44);
    ctx.lineTo(-pw * 0.22, -ph * 0.62);
    ctx.lineTo(-pw * 0.04, -ph * 0.47);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(pw * 0.04, -ph * 0.47);
    ctx.lineTo(pw * 0.22, -ph * 0.62);
    ctx.lineTo(pw * 0.14, -ph * 0.44);
    ctx.fill();

    /* Eyes */
    ctx.fillStyle = 'rgba(220,240,255,0.92)';
    ctx.shadowBlur = 7; ctx.shadowColor = '#aaddff';
    ctx.beginPath(); ctx.ellipse(pw * 0.09, -ph * 0.29, 3.5, 2.2, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-pw * 0.09, -ph * 0.29, 3.5, 2.2, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    /* Legs */
    const legSwing = (grounded && Math.abs(vx) > 0.5)
      ? Math.sin(Date.now() * 0.016) * 8 : 0;
    ctx.strokeStyle = '#161c2e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-5, ph * 0.34); ctx.lineTo(-5 - legSwing, ph * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, ph * 0.34); ctx.lineTo(5 + legSwing, ph * 0.5); ctx.stroke();

    /* Boots */
    ctx.fillStyle = '#ffe600';
    ctx.fillRect(-12 - legSwing, ph * 0.46, 10, 5);
    ctx.fillRect(2 + legSwing, ph * 0.46, 10, 5);

    ctx.restore();
  }

  /* ──────────────── LIGHTNING ──────────────── */
  function drawLightning(x1, y1, x2, y2, alpha) {
    ctx.save();
    ctx.strokeStyle = `rgba(180,220,255,${alpha * 0.85})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 14; ctx.shadowColor = '#aaddff';
    ctx.beginPath(); ctx.moveTo(x1, y1);
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      ctx.lineTo(x1 + (x2 - x1) * t + (Math.random() - 0.5) * 28, y1 + (y2 - y1) * t);
    }
    ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
  }

  /* ──────────────── PARTICLES ──────────────── */
  function spawnJumpDust() {
    for (let i = 0; i < 7; i++) {
      particles.push({
        x: player.x + player.w / 2,
        y: player.y + player.h,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2,
        r: 2 + Math.random() * 2.5,
        life: 1, decay: 0.07,
        color: '#00f5ff',
      });
    }
  }

  function spawnBlockBurst(sx, sy) {
    const cols = ['#ffe600', '#ff00ff', '#00f5ff', '#ffffff', '#7B2FFF'];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 / 30) * i;
      const spd = 2 + Math.random() * 6;
      particles.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 3,
        r: 2 + Math.random() * 3.5,
        life: 1, decay: 0.018 + Math.random() * 0.018,
        color: cols[i % cols.length],
      });
    }
    /* Star sparks */
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: sx + (Math.random() - 0.5) * 40,
        y: sy + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 5,
        r: 1.5, life: 1, decay: 0.014,
        color: '#ffe600',
      });
    }
  }

  /* ──────────────── SCORE / UNLOCK ──────────────── */
  function addScore(n) {
    score += n;
    if (scoreVal) scoreVal.innerText = String(score).padStart(6, '0');
  }

  function shootHomingBeams(index, startX, startY) {
    const card = projectCards[index];
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Target center coordinates in canvas pixel space
    const targetX = cardRect.left + cardRect.width / 2 - canvasRect.left;
    const targetY = cardRect.top + cardRect.height / 2 - canvasRect.top;

    const colors = ['#ff4d6d', '#ffe600', '#00f5ff'];
    const pColor = colors[index % colors.length];

    // Shoot 8 homing energy sparks that stream upwards dynamically
    for (let i = 0; i < 8; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      const speed = 4 + Math.random() * 5;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 3.5 + Math.random() * 2,
        life: 1,
        decay: 0,
        color: pColor,
        isHoming: true,
        targetX: targetX,
        targetY: targetY,
        projectIndex: index,
        trail: [],
      });
    }
  }

  function triggerCardDecryption(index, tx, ty) {
    if (cardUnlockingTriggered[index]) return;
    cardUnlockingTriggered[index] = true;

    // Decrypt the HTML card
    unlockProject(index);

    // Create card burst ring of glowing particles
    const colors = ['#ff4d6d', '#ffe600', '#00f5ff'];
    const pColor = colors[index % colors.length];

    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 / 40) * i;
      const spd = 3 + Math.random() * 8;
      particles.push({
        x: tx, y: ty,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r: 1.5 + Math.random() * 3,
        life: 1,
        decay: 0.022 + Math.random() * 0.022,
        color: pColor,
        isHoming: false,
      });
    }
  }

  function scrambleTextEffect(card) {
    const nameEl = card.querySelector('.hud-project-name');
    if (!nameEl) return;
    const originalText = nameEl.innerText;
    const chars = '01XYZ$&#[]_?*!@%';
    let iterations = 0;

    // Highlight text during decryption sweep
    nameEl.style.color = 'var(--tc)';
    nameEl.style.textShadow = '0 0 10px rgba(var(--tr), 0.7)';

    const interval = setInterval(() => {
      nameEl.innerText = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iterations >= originalText.length) {
        clearInterval(interval);
        nameEl.innerText = originalText;
        nameEl.style.color = '';
        nameEl.style.textShadow = '';
      }
      iterations += 0.35; // Scramble speed factor
    }, 28);
  }

  function unlockProject(index) {
    const card = projectCards[index];
    if (!card || !card.classList.contains('locked')) return;

    card.classList.remove('locked');
    card.classList.add('unlocking');

    // Scramble decrypt text effect
    scrambleTextEffect(card);

    setTimeout(() => card.classList.remove('unlocking'), 1000);

    projectsDone++;
    if (revealedVal) revealedVal.innerText = projectsDone;

    if (projectsDone >= totalProjects) {
      setTimeout(() => {
        gameRunning = false;
        if (hud) hud.style.display = 'none';
        if (victoryScreen) {
          victoryScreen.style.display = 'flex';
          setTimeout(() => { victoryScreen.style.display = 'none'; }, 4000);
        }
      }, 1200);
    }
  }

  /* ──────────────── HELPERS ──────────────── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ──────────────── GAME LOOP ──────────────── */
  function loop(time) {
    const dt = Math.min(time - lastTime, 80);
    lastTime = time;
    update(dt);
    draw();
    if (gameRunning || particles.length > 0) requestAnimationFrame(loop);
  }

  /* ──────────────── IDLE SCENE (before start) ──────────────── */
  function idleDraw() {
    resize();
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#010208'); skyGrad.addColorStop(1, '#060a1c');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, W, H);

    if (lightning && lightning.life > 0) {
      ctx.fillStyle = `rgba(160,200,255,${lightning.life * 0.06})`; ctx.fillRect(0, 0, W, H);
      drawLightning(lightning.x, 0, lightning.x + (Math.random() - 0.5) * 40, H * 0.55, lightning.life);
    }

    stars.forEach(s => {
      const sx = (s.x + W * 5) % (W + 200) - 100;
      const alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.blink));
      ctx.beginPath(); ctx.arc(sx, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${alpha})`; ctx.fill();
      s.blink += 0.035;
    });

    buildings.forEach(b => {
      if (b.x > W + 100 || b.x + b.w < 0) return;
      const buildH = b.h, buildY = H - FLOOR_H - buildH;
      ctx.globalAlpha = [0.22, 0.42, 0.68][b.layer];
      ctx.fillStyle = ['#050b1e', '#080e24', '#0c1432'][b.layer];
      ctx.fillRect(b.x, buildY, b.w, buildH); ctx.globalAlpha = 1;
      if (b.layer === 2) {
        const blink = Math.sin(Date.now() * 0.003 + b.x) > 0;
        ctx.fillStyle = blink ? '#ff0033cc' : '#22000866';
        ctx.beginPath(); ctx.arc(b.x + b.w / 2, buildY - 12, 3, 0, Math.PI * 2); ctx.fill();
      }
    });

    ctx.fillStyle = '#0d1b3e'; ctx.fillRect(0, H - FLOOR_H, W, FLOOR_H);
    ctx.fillStyle = '#00f5ff'; ctx.shadowBlur = 14; ctx.shadowColor = '#00f5ff';
    ctx.fillRect(0, H - FLOOR_H, W, 2.5); ctx.shadowBlur = 0;

    lightningTimer--;
    if (lightningTimer <= 0) {
      lightningTimer = 120 + Math.random() * 200;
      lightning = { life: 1, x: 60 + Math.random() * (W - 120) };
    }
    if (lightning) { lightning.life -= 0.09; if (lightning.life <= 0) lightning = null; }

    if (!gameRunning) requestAnimationFrame(idleDraw);
  }

  /* kick off idle */
  buildWorld();
  lastTime = performance.now();
  idleDraw();

})();
