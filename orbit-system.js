/* ================================================================
   COSMIC ORBIT SYSTEM — 3D Hybrid Cosmic Engine
   
   Features:
   - Click & Drag: Move the mouse to rotate the orbital plane in 3D (pitch & yaw).
   - Twinkling stars, drift nebulae, and shooting comets.
   - Golden central sun (B.Tech Degree) with pulsing coronal flares.
   - 4 Years representing Planets with custom 3D orbits and ring systems.
   - Subject moons orbiting the active planet in true 3D coordinates.
   - Hybrid Rendering: Moons are drawn on canvas, and their text is projected
     onto crisp HTML DOM glassmorphic badges, completely preventing any overlaps.
   - Full Cybernetic HUD Dashboard linking planet clicks and active cards.
   ================================================================ */

(function initCosmicUniverse() {
  'use strict';

  /* ── DOM Elements ── */
  const section = document.querySelector('.cosmic-section');
  const universe = document.querySelector('.cosmic-universe');
  const canvas = document.getElementById('cosmic-canvas');
  const labelsContainer = document.getElementById('cosmic-moon-labels');

  if (!canvas || !labelsContainer || !universe) return;

  const ctx = canvas.getContext('2d');

  // HUD Elements
  const hudDefault = document.getElementById('hud-default-state');
  const hudLocked = document.getElementById('hud-locked-state');
  const hudYearNum = document.getElementById('hud-year-num');
  const hudYearDates = document.getElementById('hud-year-dates');
  const hudYearTitle = document.getElementById('hud-year-title');
  const hudYearDesc = document.getElementById('hud-year-desc');
  const hudSatCount = document.getElementById('hud-sat-count');
  const hudOrbitLevel = document.getElementById('hud-orbit-level');
  const hudSubjectList = document.getElementById('hud-subject-list');
  const hudResetBtn = document.getElementById('hud-reset-btn');
  const hudSelectButtons = document.querySelectorAll('.hud-select-btn');

  /* ── System Constants & Config ── */
  const DATA = [
    {
      yearNum: "Y1",
      dates: "2021 – 2022",
      title: "THE FOUNDATIONS",
      desc: "Initiating B.Tech core systems. Forging baseline logical processors, engineering physics, graphics, and foundational mathematics.",
      sector: "ORBITAL-1",
      color: "#4fc3f7",
      colorRgb: "79, 195, 247",
      subjects: [
        { icon: "💻", name: "Programming in C" },
        { icon: "∫", name: "Calculus & Linear Algebra" },
        { icon: "⚗️", name: "Engineering Physics" },
        { icon: "📐", name: "Engineering Graphics" },
        { icon: "⚙️", name: "Engineering Mechanics" }
      ]
    },
    {
      yearNum: "Y2",
      dates: "2022 – 2023",
      title: "CORE CS SYSTEMS",
      desc: "Upgrading core algorithms. Building data processors, database platforms, and mastering Object-Oriented structures.",
      sector: "ORBITAL-2",
      color: "#4caf50",
      colorRgb: "76, 175, 80",
      subjects: [
        { icon: "🌳", name: "Data Structures & Algorithms" },
        { icon: "☕", name: "OOP — Java & C++" },
        { icon: "🔢", name: "Discrete Mathematics" },
        { icon: "🗄️", name: "Database Management" },
        { icon: "🔧", name: "Computer Organization" }
      ]
    },
    {
      yearNum: "Y3",
      dates: "2023 – 2024",
      title: "DEPTH & COMPLEXITY",
      desc: "Venturing into advanced computing fields. Programming web platforms, networks, software standards, and AI engines.",
      sector: "ORBITAL-3",
      color: "#b388ff",
      colorRgb: "179, 136, 255",
      subjects: [
        { icon: "📊", name: "Analysis of Algorithms" },
        { icon: "🌐", name: "Computer Networks" },
        { icon: "📋", name: "Software Engineering" },
        { icon: "🤖", name: "Artificial Intelligence" },
        { icon: "🖥️", name: "Web Technologies" },
        { icon: "🧮", name: "Theory of Computation" }
      ]
    },
    {
      yearNum: "Y4",
      dates: "2024 – 2025",
      title: "COSMIC MASTERY",
      desc: "Reaching high-level distribution. Launching distributed cloud instances, machine learning systems, big data arrays, and cryptographic safety.",
      sector: "ORBITAL-4",
      color: "#ffb300",
      colorRgb: "255, 179, 0",
      subjects: [
        { icon: "☁️", name: "Cloud Computing" },
        { icon: "🔐", name: "Cryptography & Security" },
        { icon: "🧠", name: "Machine Learning" },
        { icon: "📡", name: "Distributed Systems" },
        { icon: "📈", name: "Big Data Analytics" },
        { icon: "🏆", name: "Capstone Project" }
      ]
    }
  ];

  let W = 0, H = 0;
  let cx = 0, cy = 0;
  let responsiveMultiplier = 1.0;

  /* ── Interactive Viewport 3D State ── */
  let pitch = -0.32;       // vertical angle
  let yaw = 0.45;          // horizontal rotation
  let targetPitch = -0.32;
  let targetYaw = 0.45;

  let scale = 1.0;
  let targetScale = 1.0;

  let activeYearIndex = -1; // -1 means welcome state
  let hoveredYearIndex = -1;
  let activeMoonIndex = -1;

  // Viewport Drag mechanics
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  // Global Time accumulator
  let t = 0;

  /* ── Astronomical Entities ── */
  const centralSun = {
    x: 0, y: 0, z: 0,
    baseRadius: 36,
    pulseSpeed: 0.015,
    glowRadius: 100
  };

  const planets = DATA.map((year, idx) => {
    // Distribute radii spaciously
    const orbitRadius = 110 + idx * 62;
    return {
      index: idx,
      orbitRadius: orbitRadius,
      angle: idx * 1.5 + 0.5, // staggered starting angles
      orbitSpeed: 0.007 / (idx + 1) + 0.001,
      baseRadius: 14 + idx * 2.5,
      color: year.color,
      colorRgb: year.colorRgb,
      hasRings: idx === 2, // Saturn rings for Y3
      pulse: 0,

      // Position tracking (3D coordinates)
      x: 0, y: 0, z: 0,
      screenX: 0, screenY: 0, projScale: 1,
      trail: []
    };
  });

  // Twinkling stars
  const stars = [];
  const numStars = 220;
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
      r: 0.5 + Math.random() * 1.2,
      twinkleSpeed: 0.01 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Shooting comets
  const comets = [];
  const maxComets = 2;

  // Animated Shockwaves
  let shockwaves = [];

  /* ── Setup Canvas Dimensions ── */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = universe.clientWidth;
    H = universe.clientHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Position system center slightly to the left to balance the desktop HUD side panel
    cx = W > 850 ? W * 0.44 : W * 0.5;
    cy = H * 0.5;

    // Calculate dynamic responsive scale multiplier
    // Standard reference width: 950px. Limit scale between 0.45 and 1.0.
    responsiveMultiplier = Math.min(1.0, Math.max(0.45, W / 950));
  }

  /* ════════════════════════════════════════
     3D PROJECTION SYSTEM
  ════════════════════════════════════════ */
  function project3D(x, y, z) {
    // 1. Rotate Y (yaw)
    let x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
    let z1 = x * Math.sin(yaw) + z * Math.cos(yaw);

    // 2. Rotate X (pitch)
    let y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    let z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);

    // 3. Perspective Division
    const focalLength = 650;
    const projScale = focalLength / (focalLength + z2) * scale * responsiveMultiplier;

    const screenX = cx + x1 * projScale;
    const screenY = cy + y2 * projScale;

    return {
      x: screenX,
      y: screenY,
      projScale: projScale,
      zDepth: z2 // used for rendering order (z-buffering)
    };
  }

  /* ════════════════════════════════════════
     INTERACTIVE SHOCKWAVES
  ════════════════════════════════════════ */
  function spawnShockwave(x, y, z, rgbString) {
    shockwaves.push({
      x, y, z,
      radius: 5,
      maxRadius: 160 + Math.random() * 40,
      opacity: 1.0,
      decay: 0.016,
      color: rgbString
    });
  }

  /* ════════════════════════════════════════
     SPACESHIP HUD PANEL MANAGEMENT
  ════════════════════════════════════════ */
  function updateHUDState() {
    if (activeYearIndex === -1) {
      // Welcome radar state
      hudLocked.classList.remove('active');
      setTimeout(() => {
        if (activeYearIndex === -1) {
          hudDefault.classList.add('active');
        }
      }, 300);

      // Remove all DOM moon badges
      labelsContainer.innerHTML = '';
      return;
    }

    const yearData = DATA[activeYearIndex];

    // Set colors in CSS variables dynamically
    section.style.setProperty('--active-accent', yearData.color);
    section.style.setProperty('--active-accent-rgb', yearData.colorRgb);

    // Update Telemetry Panel values
    hudYearNum.textContent = yearData.yearNum;
    hudYearDates.textContent = yearData.dates;
    hudYearTitle.textContent = yearData.title;
    hudYearDesc.textContent = yearData.desc;
    hudSatCount.textContent = yearData.subjects.length;
    hudOrbitLevel.textContent = `SECTOR-${activeYearIndex + 1}`;

    // Load Subject Cards dynamically
    hudSubjectList.innerHTML = '';
    yearData.subjects.forEach((subj, sIdx) => {
      const card = document.createElement('li');
      card.className = 'hud-subject-card';
      card.dataset.idx = sIdx;
      card.style.borderLeftColor = yearData.color;
      card.style.transitionDelay = `${sIdx * 0.06}s`;
      card.innerHTML = `
        <span class="card-icon">${subj.icon}</span>
        <span class="card-name">${subj.name}</span>
      `;

      // Card Hover Actions
      card.addEventListener('mouseenter', () => {
        activeMoonIndex = sIdx;
        const domBadge = document.getElementById(`moon-badge-${sIdx}`);
        if (domBadge) domBadge.classList.add('active');
      });
      card.addEventListener('mouseleave', () => {
        activeMoonIndex = -1;
        const domBadge = document.getElementById(`moon-badge-${sIdx}`);
        if (domBadge) domBadge.classList.remove('active');
      });

      hudSubjectList.appendChild(card);
      // Trigger slide-in transition
      setTimeout(() => card.classList.add('visible'), 50);
    });

    // Toggle states
    hudDefault.classList.remove('active');
    setTimeout(() => {
      if (activeYearIndex !== -1) {
        hudLocked.classList.add('active');
      }
    }, 300);

    // Rebuild Moon DOM Labels
    rebuildDOMMoonLabels();
  }

  function rebuildDOMMoonLabels() {
    labelsContainer.innerHTML = '';
    if (activeYearIndex === -1) return;

    const yearData = DATA[activeYearIndex];
    yearData.subjects.forEach((subj, sIdx) => {
      const badge = document.createElement('div');
      badge.className = 'moon-label';
      badge.id = `moon-badge-${sIdx}`;
      badge.setAttribute('data-year', activeYearIndex);
      badge.innerHTML = `<span>${subj.icon}</span> ${subj.name}`;

      // Bi-directional hover sync
      badge.addEventListener('mouseenter', () => {
        activeMoonIndex = sIdx;
        const card = hudSubjectList.querySelector(`[data-idx="${sIdx}"]`);
        if (card) card.classList.add('active');
      });
      badge.addEventListener('mouseleave', () => {
        activeMoonIndex = -1;
        const card = hudSubjectList.querySelector(`[data-idx="${sIdx}"]`);
        if (card) card.classList.remove('active');
      });

      labelsContainer.appendChild(badge);
    });
  }

  function selectYear(idx) {
    if (idx === activeYearIndex) return;

    // Zoom focus zoom target
    activeYearIndex = idx;
    if (idx !== -1) {
      // Dynamic autofocus zoom targets:
      // Year 1/2 are smaller orbits, so zoom in (1.35x, 1.15x)
      // Year 3 is moderate, keep at 0.95x
      // Year 4 is massive, zoom OUT to 0.72x so it and its moons stay completely inside the screen bounds!
      const scales = [1.35, 1.15, 0.95, 0.72];
      targetScale = scales[idx];

      // Lock orbit tilt nicely so moons don't overlap parent planets
      targetPitch = -0.42;

      // Center camera focus on selected planet
      const p = planets[idx];
      spawnShockwave(p.x, p.y, p.z, p.colorRgb);
    } else {
      targetScale = 1.0;
      targetPitch = -0.32;
    }

    updateHUDState();
  }

  /* ════════════════════════════════════════
     CANVAS DRAWER UTILITIES
  ════════════════════════════════════════ */
  function drawHoloGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.035)';
    ctx.lineWidth = 0.85;
    ctx.setLineDash([2, 8]);

    // Concentric holographic circles
    const gridRadii = [80, 150, 220, 290, 360];
    gridRadii.forEach(r => {
      ctx.beginPath();
      const segments = 72;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const ox = r * Math.cos(theta);
        const oz = r * Math.sin(theta);
        const proj = project3D(ox, 0, oz);
        if (i === 0) {
          ctx.moveTo(proj.x, proj.y);
        } else {
          ctx.lineTo(proj.x, proj.y);
        }
      }
      ctx.stroke();
    });

    // Radial coordinate axes
    const numAxes = 8;
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.015)';
    for (let i = 0; i < numAxes; i++) {
      const theta = (i / numAxes) * Math.PI * 2;
      const projStart = project3D(0, 0, 0);
      const projEnd = project3D(380 * Math.cos(theta), 0, 380 * Math.sin(theta));

      ctx.beginPath();
      ctx.moveTo(projStart.x, projStart.y);
      ctx.lineTo(projEnd.x, projEnd.y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawStars() {
    ctx.save();
    stars.forEach(star => {
      // Map spherical stars from outer radius
      const starRadius = W * 0.95;
      const x = star.x * starRadius;
      const y = star.y * starRadius;
      const z = star.z * starRadius;

      const proj = project3D(x, y, z);
      const twinkle = 0.3 + Math.sin(t * star.twinkleSpeed + star.phase) * 0.7;

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, star.r * proj.projScale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.4})`;
      ctx.fill();
    });
    ctx.restore();
  }

  function drawDriftingNebulae() {
    ctx.save();
    // Large, multi-layered swirling gas clouds in space background
    const nebulas = [
      { cx: cx - W * 0.15, cy: cy - H * 0.1, r: H * 0.55, col: 'rgba(79, 195, 247, 0.02)' },
      { cx: cx + W * 0.12, cy: cy + H * 0.12, r: H * 0.65, col: 'rgba(179, 136, 255, 0.02)' },
      { cx: cx - W * 0.05, cy: cy + H * 0.22, r: H * 0.5, col: 'rgba(255, 179, 0, 0.015)' }
    ];

    nebulas.forEach((neb, i) => {
      // Gentle floating animation over time
      const ox = Math.sin(t * 0.002 + i) * 20;
      const oy = Math.cos(t * 0.0015 + i) * 15;

      const radG = ctx.createRadialGradient(neb.cx + ox, neb.cy + oy, 0, neb.cx + ox, neb.cy + oy, neb.r);
      radG.addColorStop(0, neb.col);
      radG.addColorStop(1, 'rgba(2, 2, 7, 0)');

      ctx.fillStyle = radG;
      ctx.fillRect(0, 0, W, H);
    });
    ctx.restore();
  }

  function updateAndDrawComets() {
    if (comets.length < maxComets && Math.random() < 0.0018) {
      comets.push({
        x: Math.random() * W,
        y: -50,
        vx: -3 - Math.random() * 5,
        vy: 3 + Math.random() * 4,
        len: 40 + Math.random() * 70,
        width: 1 + Math.random() * 1.5,
        alpha: 0.8 + Math.random() * 0.2,
        decay: 0.01 + Math.random() * 0.015
      });
    }

    ctx.save();
    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i];
      c.x += c.vx;
      c.y += c.vy;
      c.alpha -= c.decay;

      if (c.alpha <= 0 || c.x < -100 || c.y > H + 100) {
        comets.splice(i, 1);
        continue;
      }

      const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * c.len * 0.15, c.y - c.vy * c.len * 0.15);
      grad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx * 15, c.y - c.vy * 15);
      ctx.strokeStyle = grad;
      ctx.lineWidth = c.width;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawShockwaves() {
    ctx.save();
    shockwaves = shockwaves.filter(sw => sw.opacity > 0);
    shockwaves.forEach(sw => {
      sw.radius += (sw.maxRadius - sw.radius) * 0.07;
      sw.opacity -= sw.decay;

      // Draw projected shockwave circles
      const segments = 60;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const sx = sw.x + sw.radius * Math.cos(theta);
        const sz = sw.z + sw.radius * Math.sin(theta);

        const proj = project3D(sx, sw.y, sz);
        if (i === 0) {
          ctx.moveTo(proj.x, proj.y);
        } else {
          ctx.lineTo(proj.x, proj.y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${sw.color}, ${sw.opacity * 0.75})`;
      ctx.lineWidth = 2 * sw.opacity;
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawCentralSun() {
    const pulseFactor = 1 + Math.sin(t * centralSun.pulseSpeed) * 0.06;
    const currentRadius = centralSun.baseRadius * pulseFactor;

    // Projected sun coords
    const sunProj = project3D(centralSun.x, centralSun.y, centralSun.z);

    ctx.save();

    // 1. Corona Rays (Rotating overlay)
    const rays = 12;
    ctx.translate(sunProj.x, sunProj.y);
    ctx.rotate(t * 0.0035);
    ctx.strokeStyle = 'rgba(255, 185, 0, 0.06)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const endLength = currentRadius * 3;
      ctx.lineTo(Math.cos(angle) * endLength, Math.sin(angle) * endLength);
      ctx.stroke();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset matrix

    // 1.5. Magnetic Prominence Loops (Holographic loops erupting from sun surface)
    ctx.save();
    ctx.translate(sunProj.x, sunProj.y);
    ctx.rotate(t * 0.0012);
    ctx.strokeStyle = 'rgba(255, 120, 0, 0.22)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      const loopAngle = i * (Math.PI * 2 / 3);
      const loopWidth = Math.PI * 0.18;
      const loopHeight = currentRadius * (1.1 + Math.sin(t * 0.02 + i) * 0.12);

      const startX = Math.cos(loopAngle) * currentRadius * sunProj.projScale;
      const startY = Math.sin(loopAngle) * currentRadius * sunProj.projScale;

      const endX = Math.cos(loopAngle + loopWidth) * currentRadius * sunProj.projScale;
      const endY = Math.sin(loopAngle + loopWidth) * currentRadius * sunProj.projScale;

      const controlX = Math.cos(loopAngle + loopWidth / 2) * loopHeight * 1.55 * sunProj.projScale;
      const controlY = Math.sin(loopAngle + loopWidth / 2) * loopHeight * 1.55 * sunProj.projScale;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Heavy Sun Glowing Atmosphere (Radial Gradient)
    const sunGlow = ctx.createRadialGradient(
      sunProj.x, sunProj.y, currentRadius * 0.3,
      sunProj.x, sunProj.y, centralSun.glowRadius * sunProj.projScale
    );
    sunGlow.addColorStop(0, 'rgba(255, 235, 120, 0.9)');
    sunGlow.addColorStop(0.18, 'rgba(255, 160, 0, 0.5)');
    sunGlow.addColorStop(0.5, 'rgba(255, 80, 0, 0.12)');
    sunGlow.addColorStop(1, 'rgba(2, 2, 7, 0)');

    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunProj.x, sunProj.y, centralSun.glowRadius * sunProj.projScale, 0, Math.PI * 2);
    ctx.fill();

    // 3. Core Sphere
    ctx.beginPath();
    ctx.arc(sunProj.x, sunProj.y, currentRadius * sunProj.projScale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffb300';
    ctx.shadowBlur = 40;
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawOrbitsAndPlanets() {
    // 1. Draw Orbits (Tilted paths in space)
    planets.forEach(p => {
      ctx.save();
      const segments = 90;
      ctx.beginPath();

      const isSelected = p.index === activeYearIndex;
      const isHovered = p.index === hoveredYearIndex;

      // Highlight orbit ring if selected or hovered
      if (isSelected) {
        ctx.strokeStyle = `rgba(${p.colorRgb}, 0.28)`;
        ctx.lineWidth = 1.8;
      } else if (isHovered) {
        ctx.strokeStyle = `rgba(${p.colorRgb}, 0.18)`;
        ctx.lineWidth = 1.3;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 0.8;
      }

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const ox = p.orbitRadius * Math.cos(theta);
        const oz = p.orbitRadius * Math.sin(theta);
        const proj = project3D(ox, 0, oz);

        if (i === 0) {
          ctx.moveTo(proj.x, proj.y);
        } else {
          ctx.lineTo(proj.x, proj.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    });

    // Z-depth buffer array to draw background parts behind foreground elements correctly
    const renderQueue = [];

    // Calculate dynamic planet 3D coordinates
    planets.forEach(p => {
      const isSelected = p.index === activeYearIndex;

      // Update Orbit angles
      // If selected, slow down the parent planet slightly to allow easy hovering
      const speedModifier = isSelected ? 0.2 : 1.0;
      p.angle += p.orbitSpeed * speedModifier;

      p.x = p.orbitRadius * Math.cos(p.angle);
      p.y = 0;
      p.z = p.orbitRadius * Math.sin(p.angle);

      const proj = project3D(p.x, p.y, p.z);
      p.screenX = proj.x;
      p.screenY = proj.y;
      p.projScale = proj.projScale;

      // Update stardust trail history
      p.trail.push({ x: p.x, y: p.y, z: p.z, age: 1.0 });
      if (p.trail.length > 25) {
        p.trail.shift();
      }

      // Draw fading stardust trail
      ctx.save();
      p.trail.forEach((dot, dIdx) => {
        dot.age -= 0.035;
        if (dot.age <= 0) return;

        const dotProj = project3D(dot.x, dot.y, dot.z);
        const dotRadius = 1.35 * dotProj.projScale * dot.age;

        ctx.beginPath();
        ctx.arc(dotProj.x, dotProj.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRgb}, ${dot.age * 0.28})`;
        ctx.fill();
      });
      ctx.restore();

      renderQueue.push({
        type: 'planet',
        depth: proj.zDepth,
        entity: p
      });

      // 2. Add Moons to queue if planet is focused/active
      if (isSelected) {
        const yearData = DATA[p.index];
        const numMoons = yearData.subjects.length;

        // Moons orbit angle over time
        const moonOrbitAngle = t * 0.009;

        yearData.subjects.forEach((subj, sIdx) => {
          // Evenly spaced angles
          const angle = sIdx * (Math.PI * 2 / numMoons) + moonOrbitAngle;

          // Generous radius to prevent planet overlaying
          const moonRadius = 60 + Math.sin(t * 0.015 + sIdx) * 5;

          // Moons orbit tilted slightly for visual aesthetic
          const mx = p.x + moonRadius * Math.cos(angle);
          const my = moonRadius * Math.sin(angle) * Math.sin(0.4); // slightly tilted plane
          const mz = p.z + moonRadius * Math.sin(angle);

          const mProj = project3D(mx, my, mz);

          renderQueue.push({
            type: 'moon',
            depth: mProj.zDepth,
            idx: sIdx,
            planetIdx: p.index,
            screenX: mProj.x,
            screenY: mProj.y,
            projScale: mProj.projScale
          });
        });
      }
    });

    // Sort queue by depth (Painters Algorithm: back to front)
    renderQueue.sort((a, b) => b.depth - a.depth);

    // Draw sorted entities
    renderQueue.forEach(item => {
      if (item.type === 'planet') {
        drawSinglePlanet(item.entity);
      } else if (item.type === 'moon') {
        drawSingleMoon(item);
      }
    });
  }

  function drawSinglePlanet(p) {
    const isSelected = p.index === activeYearIndex;
    const isHovered = p.index === hoveredYearIndex;

    const sizeMultiplier = isSelected ? 1.45 : (isHovered ? 1.2 : 1.0);
    const radius = p.baseRadius * p.projScale * sizeMultiplier;

    ctx.save();

    // Draw 3D atmosphere/outer glow
    const atmGlow = ctx.createRadialGradient(
      p.screenX, p.screenY, radius * 0.2,
      p.screenX, p.screenY, radius * 1.8
    );
    atmGlow.addColorStop(0, `rgba(${p.colorRgb}, 0.22)`);
    atmGlow.addColorStop(0.5, `rgba(${p.colorRgb}, 0.06)`);
    atmGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = atmGlow;
    ctx.beginPath();
    ctx.arc(p.screenX, p.screenY, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Planet Sphere (3D Specular Shading effect pointing directly at the Sun)
    let dx = -p.x;
    let dy = -p.y;
    let dz = -p.z;
    let len = Math.hypot(dx, dy, dz);
    let lx = p.screenX - radius * 0.25;
    let ly = p.screenY - radius * 0.25;
    if (len > 0) {
      const lightOffsetDist = radius * 0.32;
      const sx = p.x + (dx / len) * lightOffsetDist;
      const sy = p.y + (dy / len) * lightOffsetDist;
      const sz = p.z + (dz / len) * lightOffsetDist;
      const lightProj = project3D(sx, sy, sz);
      lx = lightProj.x;
      ly = lightProj.y;
    }

    const radial = ctx.createRadialGradient(
      lx, ly, radius * 0.08,
      p.screenX, p.screenY, radius
    );
    radial.addColorStop(0, '#ffffff'); // Dynamic light source reflection
    radial.addColorStop(0.2, p.color);
    radial.addColorStop(1, '#050514'); // Shadowed back side

    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(p.screenX, p.screenY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Saturn Ring System (Year 3 Planet)
    if (p.hasRings) {
      ctx.strokeStyle = 'rgba(179, 136, 255, 0.4)';
      ctx.lineWidth = 2.5 * p.projScale;

      // Draw outer rings in 3D projection
      ctx.beginPath();
      const ringRadX = radius * 1.9;
      const ringRadY = radius * 0.55;

      ctx.ellipse(p.screenX, p.screenY, ringRadX, ringRadY, -0.15, 0, Math.PI * 2);
      ctx.stroke();

      // Inner rings
      ctx.strokeStyle = 'rgba(179, 136, 255, 0.2)';
      ctx.lineWidth = 1 * p.projScale;
      ctx.beginPath();
      ctx.ellipse(p.screenX, p.screenY, radius * 1.5, radius * 0.44, -0.15, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Active / Hovered Year Cybernetic Targeting computer reticle (replaces simple outline ring)
    if (isSelected || isHovered) {
      ctx.save();
      ctx.translate(p.screenX, p.screenY);
      ctx.rotate(t * 0.015);

      const bracketDist = radius * (1.35 + Math.sin(t * 0.08) * 0.03);
      const bracketLen = 6;

      ctx.strokeStyle = isSelected ? `rgba(${p.colorRgb}, 0.85)` : `rgba(${p.colorRgb}, 0.45)`;
      ctx.lineWidth = 1.35;

      // Top-Left [
      ctx.beginPath();
      ctx.moveTo(-bracketDist, -bracketDist + bracketLen);
      ctx.lineTo(-bracketDist, -bracketDist);
      ctx.lineTo(-bracketDist + bracketLen, -bracketDist);
      ctx.stroke();

      // Top-Right ]
      ctx.beginPath();
      ctx.moveTo(bracketDist - bracketLen, -bracketDist);
      ctx.lineTo(bracketDist, -bracketDist);
      ctx.lineTo(bracketDist, -bracketDist + bracketLen);
      ctx.stroke();

      // Bottom-Left [
      ctx.beginPath();
      ctx.moveTo(-bracketDist, bracketDist - bracketLen);
      ctx.lineTo(-bracketDist, bracketDist);
      ctx.lineTo(-bracketDist + bracketLen, bracketDist);
      ctx.stroke();

      // Bottom-Right ]
      ctx.beginPath();
      ctx.moveTo(bracketDist - bracketLen, bracketDist);
      ctx.lineTo(bracketDist, bracketDist);
      ctx.lineTo(bracketDist, bracketDist - bracketLen);
      ctx.stroke();

      // Rotating dashed locking ring
      ctx.strokeStyle = isSelected ? `rgba(${p.colorRgb}, 0.28)` : `rgba(${p.colorRgb}, 0.12)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    ctx.restore();
  }

  function drawSingleMoon(m) {
    const isMoonHovered = m.idx === activeMoonIndex;
    const sizeMultiplier = isMoonHovered ? 1.5 : 1.0;

    const mRadius = 4.5 * m.projScale * sizeMultiplier;
    const yearColor = DATA[m.planetIdx].color;

    ctx.save();

    // Connect string from moon to parent planet
    const p = planets[m.planetIdx];
    ctx.beginPath();
    ctx.moveTo(p.screenX, p.screenY);
    ctx.lineTo(m.screenX, m.screenY);
    ctx.strokeStyle = isMoonHovered ? `rgba(${p.colorRgb}, 0.2)` : `rgba(${p.colorRgb}, 0.05)`;
    ctx.lineWidth = isMoonHovered ? 1.5 : 0.8;
    ctx.stroke();

    // Satellite Glow
    ctx.beginPath();
    ctx.arc(m.screenX, m.screenY, mRadius * (isMoonHovered ? 3.0 : 2.2), 0, Math.PI * 2);
    ctx.fillStyle = isMoonHovered ? `rgba(${p.colorRgb}, 0.35)` : `rgba(${p.colorRgb}, 0.15)`;
    ctx.fill();

    // Satellite Core
    ctx.beginPath();
    ctx.arc(m.screenX, m.screenY, mRadius, 0, Math.PI * 2);
    ctx.fillStyle = isMoonHovered ? '#ffffff' : yearColor;
    ctx.fill();

    ctx.restore();

    // Dynamic HUD DOM overlay position mapping!
    const badge = document.getElementById(`moon-badge-${m.idx}`);
    if (badge) {
      badge.style.left = `${m.screenX}px`;
      badge.style.top = `${m.screenY - 14 * m.projScale}px`; // Offset above the moon

      // Stagger active class toggling
      if (isMoonHovered) {
        badge.classList.add('active');
      } else {
        badge.classList.remove('active');
      }
    }
  }

  /* ════════════════════════════════════════
     INTERACTION & SCAN MECHANISMS
  ════════════════════════════════════════ */
  function getHoveredPlanet(mx, my) {
    let hoveredIdx = -1;
    let minD = 35; // hover threshold distance in pixels

    planets.forEach(p => {
      const d = Math.hypot(mx - p.screenX, my - p.screenY);
      if (d < minD) {
        minD = d;
        hoveredIdx = p.index;
      }
    });

    return hoveredIdx;
  }

  // Handle Planet Selection Click / Hover
  universe.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    hoveredYearIndex = getHoveredPlanet(mx, my);

    // Change cursor if hovering a select-node
    if (hoveredYearIndex !== -1) {
      universe.style.cursor = 'pointer';
    } else {
      universe.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
  });

  universe.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clickedIdx = getHoveredPlanet(mx, my);
    if (clickedIdx !== -1) {
      selectYear(clickedIdx);
    }
  });

  // CLICK & DRAG 3D VIEWPORT TILT
  universe.addEventListener('mousedown', (e) => {
    // Only drag on canvas backgrounds
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (getHoveredPlanet(mx, my) !== -1) return;

    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    universe.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;

    targetYaw += deltaX * 0.0065;

    // Restrict pitch to prevent looking exactly flat or flipped upside down
    targetPitch = Math.max(-0.85, Math.min(0.05, targetPitch + deltaY * 0.0055));

    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      universe.style.cursor = hoveredYearIndex !== -1 ? 'pointer' : 'grab';
    }
  });

  // Touch Support for Mobile
  universe.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.touches[0].clientX - rect.left;
      const my = e.touches[0].clientY - rect.top;

      const clickedIdx = getHoveredPlanet(mx, my);
      if (clickedIdx !== -1) {
        selectYear(clickedIdx);
        return;
      }

      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  universe.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - prevMouseX;
    const deltaY = e.touches[0].clientY - prevMouseY;

    targetYaw += deltaX * 0.008;
    targetPitch = Math.max(-0.85, Math.min(0.05, targetPitch + deltaY * 0.007));

    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;
  }, { passive: true });

  universe.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Side-panel HUD select click triggers
  hudSelectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const yr = parseInt(btn.getAttribute('data-year'), 10);
      selectYear(yr);
    });
  });

  // Reset button action
  hudResetBtn.addEventListener('click', () => {
    selectYear(-1);
    targetYaw = 0.45;
    targetPitch = -0.32;
  });

  /* ════════════════════════════════════════
     MAIN RENDERING LOOP
  ════════════════════════════════════════ */
  function animate() {
    t++;

    // Smooth view camera easing interpolation
    pitch += (targetPitch - pitch) * 0.08;
    yaw += (targetYaw - yaw) * 0.08;
    scale += (targetScale - scale) * 0.08;

    // Clear and draw
    ctx.clearRect(0, 0, W, H);

    // Deep cosmic visual layering
    drawDriftingNebulae();
    drawStars();
    drawHoloGrid();
    updateAndDrawComets();
    drawShockwaves();
    drawCentralSun();
    drawOrbitsAndPlanets();

    requestAnimationFrame(animate);
  }

  /* ════════════════════════════════════════
     INITIALIZATION BOOT
  ════════════════════════════════════════ */
  resize();
  window.addEventListener('resize', resize);

  // Start animate loop
  requestAnimationFrame(animate);

  // Set default HUD state
  selectYear(-1);

})();
