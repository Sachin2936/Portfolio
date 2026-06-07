/* ═══════════════════════════════════════════════════════════════
   HERO PLASMA CANVAS v2 — Animated hex grid + energy waves
   Enhanced with pulsing energy ripples and dynamic glow nodes
   ═══════════════════════════════════════════════════════════════ */
(function HeroPlasma() {
  'use strict';

  const canvas = document.getElementById('hero-plasma-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, raf;
  let particles = [];
  let time = 0;
  const MAX_P = 55;
  const LINK_DIST = 130;

  // ── Resize ──────────────────────────────────────────────────────
  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    buildParticles();
  });

  // ── Particles ────────────────────────────────────────────────────
  function rand(min, max) { return min + Math.random() * (max - min); }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < MAX_P; i++) {
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.2, 0.2),
        vy: rand(-0.18, 0.18),
        r: rand(1, 2.2),
        alpha: rand(0.15, 0.45),
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        alphaSpd: rand(0.003, 0.008),
        hue: rand(36, 48), // gold range
        hueSpd: rand(0.03, 0.08),
      });
    }
  }

  // ── Hex Grid ─────────────────────────────────────────────────────
  function drawHexGrid() {
    const size = 45;
    const w = size * 2;
    const h = Math.sqrt(3) * size;

    ctx.save();
    ctx.lineWidth = 0.4;

    for (let row = -1; row < Math.ceil(H / h) + 2; row++) {
      for (let col = -1; col < Math.ceil(W / w) + 2; col++) {
        const x = col * w * 0.75;
        const y = row * h + (col % 2 === 0 ? 0 : h / 2);

        // Pulsing opacity based on distance from center
        const dx = x - W / 2;
        const dy = y - H / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.sqrt(W * W + H * H) / 2;
        const proximity = 1 - dist / maxDist;
        const pulse = 0.02 + proximity * 0.03 + Math.sin(time * 0.5 + dist * 0.003) * 0.01;

        ctx.strokeStyle = `rgba(255, 185, 0, ${pulse})`;
        drawHex(x, y, size - 1);
      }
    }
    ctx.restore();
  }

  function drawHex(cx, cy, s) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const x = cx + s * Math.cos(angle);
      const y = cy + s * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // ── Energy wave ripples ─────────────────────────────────────────
  function drawEnergyWaves() {
    const cx = W * 0.3;
    const cy = H * 0.5;
    const waveCount = 3;

    ctx.save();
    for (let i = 0; i < waveCount; i++) {
      const radius = ((time * 40 + i * 200) % 600);
      const alpha = Math.max(0, 0.06 * (1 - radius / 600));

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 185, 0, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Link Particles ───────────────────────────────────────────────
  function drawLinks() {
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DIST) {
          const strength = 1 - dist / LINK_DIST;
          const hue = (a.hue + b.hue) / 2;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${strength * 0.12})`;
          ctx.lineWidth = strength * 0.7;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // ── Draw Particles ───────────────────────────────────────────────
  function drawParticles() {
    particles.forEach(p => {
      // Oscillate alpha
      p.alpha += p.alphaDir * p.alphaSpd;
      if (p.alpha > 0.5 || p.alpha < 0.1) p.alphaDir *= -1;
      p.alpha = Math.min(0.5, Math.max(0.1, p.alpha));

      // Drift hue
      p.hue += p.hueSpd;
      if (p.hue > 55) p.hue = 36;

      // Draw glow dot
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${p.alpha})`);
      grad.addColorStop(1, `hsla(${p.hue}, 100%, 75%, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Solid core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${p.alpha * 1.5})`;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });
  }

  // ── Animated Scan Line ───────────────────────────────────────────
  let scanY = -50;
  function drawScanLine() {
    scanY += 0.5;
    if (scanY > H + 50) scanY = -50;

    const grad = ctx.createLinearGradient(0, scanY - 25, 0, scanY + 25);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.025)');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 25, W, 50);
  }

  // ── Main Loop ────────────────────────────────────────────────────
  function frame() {
    ctx.clearRect(0, 0, W, H);
    time += 0.016;

    drawHexGrid();
    drawEnergyWaves();
    drawLinks();
    drawParticles();
    drawScanLine();

    raf = requestAnimationFrame(frame);
  }

  // ── Init ─────────────────────────────────────────────────────────
  resize();
  buildParticles();
  frame();

  // Stop rendering when section not visible to save resources
  const section = document.getElementById('home');
  if (section && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!raf) frame();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }, { threshold: 0.1 });
    obs.observe(section);
  }

})();
