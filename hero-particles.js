/* ═══════════════════════════════════════════════════════════════════════════
   HERO PARTICLE FIELD — Electromagnetic Constellation
   A reactive, mouse-aware particle system that creates:
   • Magnetic field lines that curve toward the cursor
   • Electric arc connections between nearby particles
   • Gravitational lensing distortion around the portrait
   • Spark bursts on click interactions
   ═══════════════════════════════════════════════════════════════════════════ */
(function HeroParticleField() {
  'use strict';

  const canvas = document.getElementById('hero-particle-field');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, raf;
  let mouseX = -1000, mouseY = -1000;
  let mouseActive = false;
  let time = 0;

  // ── Configuration ──────────────────────────────────────────
  const CONFIG = {
    particleCount: 80,
    linkDist: 150,
    mouseDist: 250,
    mouseForce: 0.08,
    baseSpeed: 0.3,
    sparkCount: 0,
    colors: {
      gold: { h: 42, s: 100, l: 65 },
      cyan: { h: 190, s: 100, l: 55 },
      violet: { h: 260, s: 100, l: 75 },
    }
  };

  const particles = [];
  const sparks = [];

  // ── Resize ──────────────────────────────────────────────────
  function resize() {
    W = canvas.width = canvas.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    rebuildParticles();
  });

  // ── Mouse tracking ──────────────────────────────────────────
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    mouseActive = false;
  });

  // Click spark burst
  canvas.style.pointerEvents = 'none'; // let events pass through

  // ── Particle class ──────────────────────────────────────────
  function createParticle() {
    const colorKeys = Object.keys(CONFIG.colors);
    const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    const color = CONFIG.colors[colorKey];

    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * CONFIG.baseSpeed * 2,
      vy: (Math.random() - 0.5) * CONFIG.baseSpeed * 2,
      radius: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.5,
      alphaTarget: 0.2 + Math.random() * 0.5,
      color: color,
      colorKey: colorKey,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.01 + Math.random() * 0.02,
      // Orbital drift parameters
      orbitRadius: 0,
      orbitAngle: Math.random() * Math.PI * 2,
      orbitSpeed: 0.002 + Math.random() * 0.004,
    };
  }

  function rebuildParticles() {
    particles.length = 0;
    const count = Math.min(CONFIG.particleCount, Math.floor((W * H) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  // ── Draw electromagnetic field lines ────────────────────────
  function drawFieldLines() {
    if (!mouseActive) return;

    const lineCount = 6;
    ctx.save();
    ctx.globalAlpha = 0.08;

    for (let i = 0; i < lineCount; i++) {
      const angle = (Math.PI * 2 / lineCount) * i + time * 0.3;
      const startX = mouseX + Math.cos(angle) * 30;
      const startY = mouseY + Math.sin(angle) * 30;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      let cx = startX, cy = startY;
      for (let step = 0; step < 40; step++) {
        const fieldAngle = angle + Math.sin(time + step * 0.3) * 0.5;
        const speed = 4 + step * 0.5;
        cx += Math.cos(fieldAngle) * speed;
        cy += Math.sin(fieldAngle) * speed;
        ctx.lineTo(cx, cy);
      }

      const gradient = ctx.createLinearGradient(startX, startY, cx, cy);
      gradient.addColorStop(0, `hsla(42, 100%, 65%, 0.4)`);
      gradient.addColorStop(0.5, `hsla(190, 100%, 55%, 0.2)`);
      gradient.addColorStop(1, `hsla(260, 100%, 75%, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── Draw particle connections ───────────────────────────────
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];

      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.linkDist) {
          const strength = 1 - dist / CONFIG.linkDist;
          const hue = a.colorKey === 'gold' ? 42 : a.colorKey === 'cyan' ? 190 : 260;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);

          // Arc the connection line slightly for visual drama
          const midX = (a.x + b.x) / 2 + Math.sin(time + i) * strength * 8;
          const midY = (a.y + b.y) / 2 + Math.cos(time + j) * strength * 8;
          ctx.quadraticCurveTo(midX, midY, b.x, b.y);

          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${strength * 0.18})`;
          ctx.lineWidth = strength * 1.2;
          ctx.stroke();
        }
      }

      // Mouse connections — electric arcs
      if (mouseActive) {
        const mdx = a.x - mouseX;
        const mdy = a.y - mouseY;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mDist < CONFIG.mouseDist) {
          const strength = 1 - mDist / CONFIG.mouseDist;
          const hue = 42 + strength * 148; // gold -> cyan transition

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);

          // Electric arc effect — zigzag path
          const segments = 4 + Math.floor(strength * 4);
          let px = a.x, py = a.y;
          for (let s = 1; s <= segments; s++) {
            const t = s / segments;
            const lx = a.x + (mouseX - a.x) * t;
            const ly = a.y + (mouseY - a.y) * t;
            const jitter = (1 - t) * strength * 12;
            px = lx + (Math.random() - 0.5) * jitter;
            py = ly + (Math.random() - 0.5) * jitter;
            ctx.lineTo(px, py);
          }

          ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${strength * 0.5})`;
          ctx.lineWidth = strength * 1.5;
          ctx.stroke();
        }
      }
    }
  }

  // ── Draw and update particles ───────────────────────────────
  function drawParticles() {
    particles.forEach(p => {
      // Phase oscillation
      p.phase += p.phaseSpeed;
      p.alpha = p.alphaTarget + Math.sin(p.phase) * 0.15;
      p.alpha = Math.max(0.05, Math.min(0.7, p.alpha));

      // Mouse magnetic influence
      if (mouseActive) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.mouseDist && dist > 10) {
          const force = CONFIG.mouseForce * (1 - dist / CONFIG.mouseDist);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Apply velocity
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;

      // Draw particle glow
      const { h, s, l } = p.color;
      const pulseRadius = p.radius * (1 + Math.sin(p.phase) * 0.3);

      // Outer glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseRadius * 4);
      grad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${p.alpha * 0.8})`);
      grad.addColorStop(0.5, `hsla(${h}, ${s}%, ${l}%, ${p.alpha * 0.2})`);
      grad.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseRadius * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, ${s}%, ${Math.min(l + 20, 95)}%, ${p.alpha * 1.5})`;
      ctx.fill();
    });
  }

  // ── Draw gravitational lensing ring around portrait ──────────
  function drawLensingRing() {
    // Find the portrait center (approximation)
    const portalEl = document.querySelector('.photo-portal-frame');
    if (!portalEl) return;

    const rect = portalEl.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - canvasRect.left;
    const cy = rect.top + rect.height / 2 - canvasRect.top;
    const radius = rect.width / 2 + 15;

    ctx.save();

    // Rotating arc segments
    const arcCount = 3;
    for (let i = 0; i < arcCount; i++) {
      const startAngle = time * 0.5 + (Math.PI * 2 / arcCount) * i;
      const arcLength = Math.PI * 0.6 + Math.sin(time + i) * 0.2;

      ctx.beginPath();
      ctx.arc(cx, cy, radius + Math.sin(time * 2 + i) * 3, startAngle, startAngle + arcLength);

      const hue = 42 + i * 75; // gold, cyan, violet
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.1 + Math.sin(time + i * 2) * 0.05})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Subtle gravitational glow
    const grad = ctx.createRadialGradient(cx, cy, radius - 20, cx, cy, radius + 40);
    grad.addColorStop(0, `hsla(42, 100%, 65%, 0)`);
    grad.addColorStop(0.5, `hsla(42, 100%, 65%, ${0.03 + Math.sin(time) * 0.015})`);
    grad.addColorStop(1, `hsla(42, 100%, 65%, 0)`);

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 30, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }

  // ── Main animation loop ─────────────────────────────────────
  function frame() {
    ctx.clearRect(0, 0, W, H);
    time += 0.016;

    drawFieldLines();
    drawConnections();
    drawParticles();
    drawLensingRing();

    raf = requestAnimationFrame(frame);
  }

  // ── Init ────────────────────────────────────────────────────
  resize();
  rebuildParticles();
  frame();

  // Performance: pause when not visible
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
