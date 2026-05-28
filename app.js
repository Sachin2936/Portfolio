/* ========================================================
   SACHIN SINGH PORTFOLIO — All JavaScript
   Handles: cursor, scroll, canvas bg, hero chars,
            timeline reveal, card reveals, counters,
            LeetCode ring, nav active, click sparks
   ======================================================== */

(function () {
  'use strict';

  /* ── 1. CURSOR ── */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  // Scale ring on hoverable elements
  document.querySelectorAll('a, button, .project-card, .act-card, .profile-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.style.transform = 'translate(-50%,-50%) scale(1.8)');
    el.addEventListener('mouseleave', () => ring.style.transform = 'translate(-50%,-50%) scale(1)');
  });

  /* ── 2. SCROLL PROGRESS BAR ── */
  const scrollBar = document.getElementById('scroll-bar');
  const navbar    = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    scrollBar.style.width = (scrolled / total * 100) + '%';
    navbar.classList.toggle('scrolled', scrolled > 50);
    updateActiveNav();
  }, { passive: true });

  /* ── 3. ACTIVE NAV HIGHLIGHT ── */
  const navItems   = document.querySelectorAll('.nav-item');
  const sections   = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navItems.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ── 4. BACKGROUND CANVAS — Floating Nodes + Connections ── */
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, nodes = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', () => { resize(); buildNodes(); }, { passive: true });

  function buildNodes() {
    nodes = [];
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      });
    }
  }

  buildNodes();

  let mouseNode = { x: W / 2, y: H / 2 };
  window.addEventListener('mousemove', e => {
    mouseNode.x = e.clientX;
    mouseNode.y = e.clientY;
  }, { passive: true });

  function drawCanvas() {
    ctx.clearRect(0, 0, W, H);

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Connections
    const allNodes = [mouseNode, ...nodes];
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const a = allNodes[i], b = allNodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const maxDist = i === 0 ? 180 : 120;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.4 * (i === 0 ? 1.5 : 1);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth   = i === 0 ? 0.8 : 0.4;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Dots
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${n.a})`;
      ctx.fill();
    });

    requestAnimationFrame(drawCanvas);
  }

  drawCanvas();

  /* ── 5. HERO CHAR ANIMATION ── */
  function animateHero() {
    // Tag
    const tag = document.querySelector('.hero-tag');
    if (tag) setTimeout(() => tag.classList.add('visible'), 100);

    // Characters
    const chars = document.querySelectorAll('.char');
    chars.forEach((c, i) => {
      setTimeout(() => c.classList.add('visible'), 150 + i * 50);
    });

    // Other hero elements
    const delayed = ['.hero-role', '.hero-bio', '.hero-cta', '.hero-stats', '.hero-visual'];
    delayed.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        // trigger CSS transition via class
        setTimeout(() => el.classList.add('visible'), 0);
      }
    });
  }

  // Run on load
  window.addEventListener('load', animateHero);

  /* ── 6. INTERSECTION OBSERVER — Reveal on Scroll ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  // Section-tag, section-title
  document.querySelectorAll('.section-tag, .section-title').forEach(el => {
    el.classList.add('sr', 'sr-up');
    revealObserver.observe(el);
  });

  // Project cards
  document.querySelectorAll('.project-card').forEach((el, i) => {
    revealObserver.observe(el);
  });

  // Timeline rows
  document.querySelectorAll('.tl-row').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.12) + 's';
    revealObserver.observe(el);
  });

  // Activities cards
  document.querySelectorAll('.act-card').forEach((el, i) => {
    const delay = el.dataset.delay || 0;
    el.style.animationDelay = delay + 'ms';
    revealObserver.observe(el);
  });

  // Profile cards
  document.querySelectorAll('.profile-card').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── 7. COUNTER ANIMATION ── */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

  /* ── 8. LEETCODE RING ANIMATION ── */
  const lcArc = document.getElementById('lc-arc');
  const lcNum = document.getElementById('lc-num');

  if (lcArc && lcNum) {
    const lcObs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      const total   = 750;
      const maxProb = 3000;
      const circum  = 201;
      const targetOffset = circum - (total / maxProb * circum);
      lcArc.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.16,1,0.3,1)';
      lcArc.style.strokeDashoffset = targetOffset;

      // Animate number
      const duration = 2000;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        lcNum.textContent = Math.round(eased * total);
        if (p < 1) requestAnimationFrame(tick);
        else lcNum.textContent = total;
      })(performance.now());

      lcObs.disconnect();
    }, { threshold: 0.5 });

    lcObs.observe(lcArc);
  }

  /* ── 9. CLICK SPARKS ── */
  function createSpark(x, y) {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f97316'];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 3;
      p.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        transform-origin: center;
        animation-duration: ${Math.random() * 0.5 + 0.6}s;
      `;
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
      const dist  = Math.random() * 50 + 30;
      p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`, opacity: 0 }
      ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' });
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  document.addEventListener('click', e => createSpark(e.clientX, e.clientY));

  /* ── 10. CARD MAGNETIC TILT ── */
  document.querySelectorAll('.project-card, .profile-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });

  /* ── 11. SMOOTH NAV SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 12. TIMELINE STAGGER (already via CSS transitionDelay set above) ── */
  // Nothing extra needed

  /* ── 13. SECTION TITLE GRADIENT SHIMMER ON HOVER ── */
  document.querySelectorAll('.section-title').forEach(title => {
    title.addEventListener('mouseenter', () => {
      title.style.background = 'linear-gradient(135deg, #e2e8f0, #6366f1, #06b6d4)';
      title.style.webkitBackgroundClip = 'text';
      title.style.webkitTextFillColor = 'transparent';
      title.style.backgroundClip = 'text';
    });
    title.addEventListener('mouseleave', () => {
      title.style.background = '';
      title.style.webkitBackgroundClip = '';
      title.style.webkitTextFillColor = '';
      title.style.backgroundClip = '';
    });
  });

  /* ── 14. ACTIVITY CARDS — icon bounce on hover ── */
  document.querySelectorAll('.act-card').forEach(card => {
    const icon = card.querySelector('.act-icon');
    card.addEventListener('mouseenter', () => {
      if (icon) icon.style.transform = 'translateY(-6px) rotate(-5deg) scale(1.15)';
    });
    card.addEventListener('mouseleave', () => {
      if (icon) icon.style.transform = '';
    });
  });

  /* ── 15. PARALLAX ORB EFFECT on mouse move ── */
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  const orb3 = document.querySelector('.orb-3');

  document.addEventListener('mousemove', e => {
    const px = (e.clientX / window.innerWidth  - 0.5) * 2;
    const py = (e.clientY / window.innerHeight - 0.5) * 2;
    if (orb1) orb1.style.transform = `translate(${px * 20}px, ${py * 20}px)`;
    if (orb2) orb2.style.transform = `translate(${-px * 15}px, ${-py * 15}px)`;
    if (orb3) orb3.style.transform = `translate(${px * 10}px, ${py * 25}px)`;
  }, { passive: true });

})();
