/* =========================================================================
   ATMOSPHERIC CURSOR DOMAIN SHIFTER
   Futuristic click-through canvas particle engine tracking active hero sections
   ========================================================================= */

(function () {
  'use strict';

  // Create Canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'cursor-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Handle Resize
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const MAX_PARTICLES = 100; // Keep locked at 60fps
  let mouse = { x: 0, y: 0, lastX: 0, lastY: 0, speed: 0 };
  let activeHero = 'batman';

  // Smart Section & Active Hero Detector
  document.addEventListener('mousemove', (e) => {
    mouse.speed = Math.sqrt(Math.pow(e.clientX - mouse.x, 2) + Math.pow(e.clientY - mouse.y, 2));
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const sect = e.target.closest('section');
    if (sect) {
      const id = sect.id;
      if (id === 'home') activeHero = 'batman';
      else if (id === 'projects') activeHero = 'spiderman';
      else if (id === 'journey') activeHero = 'mystic';
      else if (id === 'arsenal') activeHero = 'flash';
      else if (id === 'activities') activeHero = 'flash';
      else if (id === 'connect') activeHero = 'venom';
    }

    // Spawn count based on cursor velocity
    const spawnCount = Math.min(Math.floor(mouse.speed / 4) + 1, 4);
    for (let i = 0; i < spawnCount; i++) {
      if (particles.length < MAX_PARTICLES) {
        particles.push(createParticle(mouse.x, mouse.y));
      }
    }
  });

  function createParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.4;
    
    return {
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (activeHero === 'mystic' || activeHero === 'venom' ? 0.6 : 0), // gravity float
      life: 1.0,
      decay: Math.random() * 0.025 + 0.012,
      size: Math.random() * 4 + 2,
      hero: activeHero,
      color: getHeroColor(activeHero),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      jags: Math.floor(Math.random() * 3) + 2
    };
  }

  function getHeroColor(hero) {
    switch (hero) {
      case 'batman': return '#FFD700'; // Gold
      case 'spiderman': return '#FF4D6D'; // Crimson Red
      case 'mystic': return '#FFA500'; // Orange
      case 'flash': return '#FFEA00'; // Lightning Gold
      case 'venom': return '#A78BFA'; // Purple
      default: return '#FFD700';
    }
  }

  function update() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Physics morphs
      if (p.hero === 'venom') {
        p.vy -= 0.015;
        p.vx += Math.sin(Date.now() / 250 + p.x) * 0.04; // slime sway
      } else if (p.hero === 'mystic') {
        p.rotation += p.rotSpeed;
        p.vy -= 0.008;
      } else if (p.hero === 'flash') {
        p.vx += (Math.random() - 0.5) * 1.2;
        p.vy += (Math.random() - 0.5) * 1.2;
      }

      p.x += p.vx;
      p.y += p.vy;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Spiderman Interactive Webs Connection (Only on Spiderman section)
    if (activeHero === 'spiderman') {
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.hero !== 'spiderman') continue;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.hero !== 'spiderman') continue;
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 70) {
            const alpha = (1 - dist / 70) * 0.22 * Math.min(p1.life, p2.life);
            ctx.strokeStyle = `rgba(255, 77, 109, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();
    }

    // 2. Draw Individual Themed Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = p.hero === 'flash' ? 10 : 5;
      ctx.shadowColor = p.color;

      if (p.hero === 'batman') {
        // Batman Outlined Bats
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.sin(Date.now() / 150 + p.x) * 0.25); // flapping sway
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Simplified elegant bat wings path
        ctx.moveTo(0, -p.size * 0.2);
        ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.7, -p.size * 1.1, -p.size * 0.1);
        ctx.quadraticCurveTo(-p.size * 0.4, p.size * 0.2, 0, p.size * 0.5);
        ctx.quadraticCurveTo(p.size * 0.4, p.size * 0.2, p.size * 1.1, -p.size * 0.1);
        ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.7, 0, -p.size * 0.2);
        ctx.fill();

      } else if (p.hero === 'spiderman') {
        // Spidey Web Nodes
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

      } else if (p.hero === 'mystic') {
        // Mystic Rotating Rune Glyphs
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.8;
        
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-p.size * 1.6, 0);
        ctx.lineTo(p.size * 1.6, 0);
        ctx.moveTo(0, -p.size * 1.6);
        ctx.lineTo(0, p.size * 1.6);
        ctx.stroke();

      } else if (p.hero === 'flash') {
        // Lightning Bolt Crackles
        ctx.strokeStyle = '#FFFFFF'; // White electric hot core
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);

        let cx = p.x;
        let cy = p.y;
        for (let i = 0; i < p.jags; i++) {
          cx += p.vx * 1.2 + (Math.random() - 0.5) * 10;
          cy += p.vy * 1.2 + (Math.random() - 0.5) * 10;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();

      } else if (p.hero === 'venom') {
        // Gooey Symbiote Blob Metaballs
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.3 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = '#060608';
        ctx.fill();
      }

      ctx.restore();
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
})();
