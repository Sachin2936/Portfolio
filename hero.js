/* ═══════════════════════════════════════════════════════
   SACHIN SINGH — SUPERHERO PORTFOLIO JS
   Animations: Batman Rain | Spider-Man Web | Iron Man HUD
                Flash Lightning | Venom Tendrils + all reveals
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════ 1. CUSTOM CURSOR ══════════ */
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  /* ══════════ 1b. SYNTHETIC SOUND ENGINE & BACKDROP INTERACTIVE PARALLAX ══════════ */
  // We use Web Audio API to synthesize high-quality, signature audio soundscapes for each hero
  // to completely avoid third-party resource loading issues and CORS.
  
  let audioCtx = null;
  let isSoundActive = false; // Off by default to comply with browser autoplay restrictions
  
  const soundToggleBtn = document.getElementById('sound-toggle');
  
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  function toggleSound() {
    initAudio();
    isSoundActive = !isSoundActive;
    if (soundToggleBtn) {
      soundToggleBtn.classList.toggle('active', isSoundActive);
      soundToggleBtn.querySelector('.sound-text').textContent = isSoundActive ? 'SOUND: ON' : 'SOUND: OFF';
    }
    
    // Play a confirmation sound
    if (isSoundActive) {
      playConfirmationSynth();
    }
  }
  
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', toggleSound);
  }
  
  // A clean synth beep when turning sound ON
  function playConfirmationSynth() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }
  
  // Real-time Sound Synthesis Functions for each Hero!
  const heroSounds = {
    batman: () => {
      // Batman: Deep Gothic Gong/Bell + Dark Whoosh
      if (!audioCtx || !isSoundActive) return;
      
      const now = audioCtx.currentTime;
      
      // 1. Gothic Chime
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(75, now); // low G
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(150, now); // octave up
      
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
      
      // 2. Flying Batarang Whoosh
      const noiseLength = audioCtx.sampleRate * 0.5; // 0.5 sec
      const buffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLength; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.Q.setValueAtTime(3.0, now);
      noiseFilter.frequency.setValueAtTime(200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
      noiseFilter.frequency.exponentialRampToValueAtTime(300, now + 0.5);
      
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      
      noise.start(now);
      noise.stop(now + 0.5);
    },
    
    spiderman: () => {
      // Spider-Man: Web Shooter "THWIP!"
      if (!audioCtx || !isSoundActive) return;
      const now = audioCtx.currentTime;
      
      // 1. Noise Burst (Web hiss)
      const noiseLength = audioCtx.sampleRate * 0.16; // short
      const buffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLength; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.0, now);
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      noise.start(now);
      noise.stop(now + 0.16);
      
      // 2. High Frequency Whip/Tension
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.14);
      
      oscGain.gain.setValueAtTime(0.08, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      
      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.14);
    },
    
    ironman: () => {
      // Iron Man: Repulsor Power Charge + Shoot
      if (!audioCtx || !isSoundActive) return;
      const now = audioCtx.currentTime;
      
      // 1. Repulsor Charge (Sweeping pitch up)
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.85);
      
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.7);
      gainNode.gain.linearRampToValueAtTime(0.001, now + 0.85);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.85);
      
      // 2. Repulsor Blast (Fires at 0.8s)
      const blastTime = now + 0.8;
      
      const blastOsc = audioCtx.createOscillator();
      const blastGain = audioCtx.createGain();
      blastOsc.type = 'sawtooth';
      blastOsc.frequency.setValueAtTime(1200, blastTime);
      blastOsc.frequency.exponentialRampToValueAtTime(80, blastTime + 0.35);
      
      blastGain.gain.setValueAtTime(0.2, blastTime);
      blastGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 0.35);
      
      const blastFilter = audioCtx.createBiquadFilter();
      blastFilter.type = 'highpass';
      blastFilter.frequency.setValueAtTime(300, blastTime);
      
      blastOsc.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(audioCtx.destination);
      
      blastOsc.start(blastTime);
      blastOsc.stop(blastTime + 0.35);
      
      // Blast Hiss noise
      const noiseLength = audioCtx.sampleRate * 0.3;
      const buffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLength; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.15, blastTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 0.3);
      
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      
      noise.start(blastTime);
      noise.stop(blastTime + 0.3);
    },
    
    flash: () => {
      // The Flash: Electric Static Sparks + Speed Whoosh
      if (!audioCtx || !isSoundActive) return;
      const now = audioCtx.currentTime;
      
      // 1. Lightning Crackle (Noise clicks)
      for (let i = 0; i < 7; i++) {
        const triggerTime = now + i * 0.04 + Math.random() * 0.02;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 800, triggerTime);
        
        gainNode.gain.setValueAtTime(0.06, triggerTime);
        gainNode.gain.setValueAtTime(0, triggerTime + 0.015);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(triggerTime);
        osc.stop(triggerTime + 0.02);
      }
      
      // 2. Sonic Boom/Lightning Sweep
      const sweepOsc = audioCtx.createOscillator();
      const sweepGain = audioCtx.createGain();
      sweepOsc.type = 'sine';
      sweepOsc.frequency.setValueAtTime(80, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
      sweepOsc.frequency.exponentialRampToValueAtTime(100, now + 0.45);
      
      sweepGain.gain.setValueAtTime(0.15, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      sweepOsc.connect(sweepGain);
      sweepGain.connect(audioCtx.destination);
      
      sweepOsc.start(now);
      sweepOsc.stop(now + 0.45);
    },
    
    venom: () => {
      // Venom: Alien Symbiote Snarl & Low Roar
      if (!audioCtx || !isSoundActive) return;
      const now = audioCtx.currentTime;
      
      // Low snarling modular wave
      const osc = audioCtx.createOscillator();
      const mod = audioCtx.createOscillator();
      const modGain = audioCtx.createGain();
      const mainGain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, now);
      
      mod.type = 'sawtooth';
      mod.frequency.setValueAtTime(14, now); // growly vibrato
      
      modGain.gain.setValueAtTime(20, now); // depth of modulation
      
      mainGain.gain.setValueAtTime(0.22, now);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.0, now);
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.9);
      
      mod.connect(modGain);
      modGain.connect(osc.frequency);
      
      osc.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(audioCtx.destination);
      
      osc.start(now);
      mod.start(now);
      osc.stop(now + 1.2);
      mod.stop(now + 1.2);
      
      // Slime screech noise overlay
      const noiseLength = audioCtx.sampleRate * 0.8;
      const buffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < noiseLength; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'peaking';
      noiseFilter.frequency.setValueAtTime(1800, now);
      noiseFilter.frequency.linearRampToValueAtTime(600, now + 0.8);
      
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.04, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      
      noise.start(now);
      noise.stop(now + 0.8);
    }
  };
  
  // Section background parallax & unblur mouse follow
  document.querySelectorAll('section').forEach(section => {
    const bgImg = section.querySelector('.bg-hero-img');
    if (!bgImg) return;
    
    section.addEventListener('mousemove', e => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      // Smoothly shift the background image with 3D translation
      bgImg.style.transform = `scale(1.06) translate3d(${x * 35}px, ${y * 22}px, 0)`;
    });
    
    section.addEventListener('mouseleave', () => {
      bgImg.style.transform = '';
    });
  });
  
  // Quote box sound click activation
  document.querySelectorAll('.bg-hero-quote-box').forEach(box => {
    box.addEventListener('click', () => {
      initAudio();
      const parentBg = box.closest('.section-hero-bg');
      if (parentBg) {
        const hero = parentBg.dataset.hero;
        if (heroSounds[hero]) {
          heroSounds[hero]();
        }
      }
    });
  });
  
  // Scroll intersection sound trigger
  const activeSections = new Set();
  const soundObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const secId = entry.target.id;
        
        // Map section ID to hero name
        const heroMap = {
          home: 'batman',
          projects: 'spiderman',
          journey: 'ironman',
          activities: 'flash',
          profiles: 'venom'
        };
        
        const hero = heroMap[secId];
        if (hero && !activeSections.has(secId)) {
          activeSections.add(secId);
          initAudio();
          // Trigger the entrance sound!
          if (heroSounds[hero]) {
            setTimeout(() => {
              heroSounds[hero]();
            }, 300); // short delay for visual sweep sync
          }
        }
      } else {
        activeSections.delete(entry.target.id);
      }
    });
  }, { threshold: 0.45 });
  
  document.querySelectorAll('section[id]').forEach(s => soundObserver.observe(s));


  // Theme-aware cursor color per section
  const sectionColors = {
    home:       { dot: '#FFD700', ring: 'rgba(255,215,0,0.5)' },
    projects:   { dot: '#dc143c', ring: 'rgba(220,20,60,0.5)' },
    journey:    { dot: '#00d4ff', ring: 'rgba(0,212,255,0.5)' },
    activities: { dot: '#FFD700', ring: 'rgba(255,215,0,0.5)' },
    profiles:   { dot: '#8b00ff', ring: 'rgba(139,0,255,0.5)' },
  };

  (function lazyRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(lazyRing);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
      ring.style.borderWidth = '1px';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.borderWidth = '1.5px';
    });
  });

  /* ══════════ 2. SCROLL PROGRESS + NAV ══════════ */
  const prog   = document.getElementById('scroll-prog');
  const nav    = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nl');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const total   = document.body.scrollHeight - window.innerHeight;
    prog.style.width = (scrollY / total * 100) + '%';
    nav.classList.toggle('scrolled', scrollY > 60);

    // Active nav link
    let current = 'home';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 200) current = s.id; });
    navLinks.forEach(a => {
      const active = a.getAttribute('href') === '#' + current;
      a.classList.toggle('active', active);
    });

    // Change cursor colour per section
    const col = sectionColors[current] || sectionColors.home;
    dot.style.background = col.dot;
    ring.style.borderColor = col.ring;
  }, { passive: true });

  /* ══════════ 3. CLICK RIPPLE / SPARKS ══════════ */
  const ripCont = document.getElementById('ripple-container');
  const heroColors = ['#FFD700', '#dc143c', '#00d4ff', '#FFD700', '#8b00ff'];
  let currentSection = 'home';

  sections.forEach(s => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) currentSection = s.id;
    }, { threshold: 0.5 }).observe(s);
  });

  document.addEventListener('click', e => {
    const colorMap = {
      home: '#FFD700', projects: '#dc143c',
      journey: '#00d4ff', activities: '#FFD700', profiles: '#8b00ff'
    };
    const color = colorMap[currentSection] || '#FFD700';

    // Ripple
    const r = document.createElement('div');
    r.className = 'click-ripple';
    r.style.cssText = `left:${e.clientX}px; top:${e.clientY}px; width:60px; height:60px; border:2px solid ${color};`;
    ripCont.appendChild(r);
    setTimeout(() => r.remove(), 800);

    // Sparks
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.3;
      const dist  = 30 + Math.random() * 50;
      p.style.cssText = `
        position:fixed; pointer-events:none; z-index:9997;
        width:${3 + Math.random() * 5}px; height:${3 + Math.random() * 5}px;
        background:${color}; border-radius:50%;
        left:${e.clientX}px; top:${e.clientY}px;
      `;
      ripCont.appendChild(p);
      p.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' });
      setTimeout(() => p.remove(), 1100);
    }
  });

  /* ══════════ 4. BATMAN RAIN CANVAS ══════════ */
  const rainCanvas = document.getElementById('batman-rain');
  if (rainCanvas) {
    const rc = rainCanvas.getContext('2d');
    let rW, rH;

    function resizeRain() {
      rW = rainCanvas.width  = rainCanvas.offsetWidth;
      rH = rainCanvas.height = rainCanvas.offsetHeight;
    }
    resizeRain();
    window.addEventListener('resize', resizeRain, { passive: true });

    const drops = Array.from({ length: 180 }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      speed: 4 + Math.random() * 8,
      len: 12 + Math.random() * 20,
      a: 0.05 + Math.random() * 0.15,
    }));

    function drawRain() {
      rc.clearRect(0, 0, rW, rH);
      drops.forEach(d => {
        rc.beginPath();
        rc.strokeStyle = `rgba(180,180,220,${d.a})`;
        rc.lineWidth = 0.8;
        rc.moveTo(d.x, d.y);
        rc.lineTo(d.x - 2, d.y + d.len);
        rc.stroke();
        d.y += d.speed;
        if (d.y > rH) { d.y = -d.len; d.x = Math.random() * rW; }
      });
      requestAnimationFrame(drawRain);
    }
    drawRain();
  }

  /* ══════════ 5. SPIDER-MAN WEB CANVAS ══════════ */
  const webCanvas = document.getElementById('web-canvas');
  if (webCanvas) {
    const wc = webCanvas.getContext('2d');
    let wW, wH;

    function resizeWeb() {
      wW = webCanvas.width  = webCanvas.offsetWidth;
      wH = webCanvas.height = webCanvas.offsetHeight;
    }
    resizeWeb();
    window.addEventListener('resize', resizeWeb, { passive: true });

    // Draw radial web pattern
    function drawWeb() {
      wc.clearRect(0, 0, wW, wH);

      const cx = wW / 2, cy = wH / 2;
      const spokes = 12;
      const rings  = 8;
      const maxR   = Math.max(wW, wH) * 0.8;

      for (let s = 0; s < spokes; s++) {
        const angle = (Math.PI * 2 / spokes) * s;
        wc.beginPath();
        wc.strokeStyle = 'rgba(220,20,60,0.06)';
        wc.lineWidth = 1;
        wc.moveTo(cx, cy);
        wc.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        wc.stroke();
      }

      for (let r = 1; r <= rings; r++) {
        const radius = (maxR / rings) * r;
        wc.beginPath();
        for (let s = 0; s <= spokes; s++) {
          const angle = (Math.PI * 2 / spokes) * s;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          if (s === 0) wc.moveTo(x, y); else wc.lineTo(x, y);
        }
        wc.strokeStyle = `rgba(220,20,60,${0.08 - r * 0.008})`;
        wc.lineWidth = 1;
        wc.stroke();
      }

      // Animated web strands along edges
      const t = Date.now() / 1000;
      for (let i = 0; i < 6; i++) {
        const x1 = Math.random() * wW, y1 = 0;
        const x2 = x1 + (Math.random() - 0.5) * 100;
        const y2 = 100 + Math.random() * 200;
        wc.beginPath();
        wc.moveTo(x1, y1);
        wc.quadraticCurveTo(x1 + Math.sin(t + i) * 30, y2 / 2, x2, y2);
        wc.strokeStyle = 'rgba(220,20,60,0.1)';
        wc.lineWidth = 0.8;
        wc.stroke();
      }

      setTimeout(drawWeb, 3000);
    }
    drawWeb();

    // Animated spider node network
    const spiderNodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * 1920, y: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    }));

    let mouseX = 0, mouseY = 0;
    webCanvas.addEventListener('mousemove', e => {
      const r = webCanvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    });

    function animateWeb() {
      wc.clearRect(0, 0, wW, wH);
      drawWebStatic();

      spiderNodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > wW) n.vx *= -1;
        if (n.y < 0 || n.y > wH) n.vy *= -1;
      });

      // Draw connections
      spiderNodes.forEach((a, i) => {
        spiderNodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.25;
            wc.beginPath();
            wc.strokeStyle = `rgba(220,20,60,${alpha})`;
            wc.lineWidth = 0.6;
            wc.moveTo(a.x, a.y); wc.lineTo(b.x, b.y);
            wc.stroke();
          }
        });
        // Mouse connections
        const dm = Math.hypot(a.x - mouseX, a.y - mouseY);
        if (dm < 160) {
          wc.beginPath();
          wc.strokeStyle = `rgba(220,20,60,${(1 - dm/160) * 0.6})`;
          wc.lineWidth = 1;
          wc.moveTo(a.x, a.y); wc.lineTo(mouseX, mouseY);
          wc.stroke();
        }
      });

      requestAnimationFrame(animateWeb);
    }

    function drawWebStatic() {
      const cx = wW/2, cy = wH/2, spokes = 12, rings = 6, maxR = Math.max(wW,wH)*0.7;
      for (let s = 0; s < spokes; s++) {
        const a = (Math.PI*2/spokes)*s;
        wc.beginPath();
        wc.strokeStyle = 'rgba(220,20,60,0.04)';
        wc.moveTo(cx,cy); wc.lineTo(cx+Math.cos(a)*maxR, cy+Math.sin(a)*maxR); wc.stroke();
      }
      for (let r = 1; r <= rings; r++) {
        const rad = (maxR/rings)*r;
        wc.beginPath();
        for (let s = 0; s <= spokes; s++) {
          const a = (Math.PI*2/spokes)*s;
          const x = cx+Math.cos(a)*rad, y = cy+Math.sin(a)*rad;
          s===0 ? wc.moveTo(x,y) : wc.lineTo(x,y);
        }
        wc.strokeStyle = `rgba(220,20,60,${0.05 - r*0.006})`; wc.stroke();
      }
    }

    animateWeb();
  }

  /* ══════════ 6. MYSTIC FIREFLY CANVAS ══════════ */
  const mysticCanvas = document.getElementById('mystic-canvas');
  if (mysticCanvas) {
    const mc = mysticCanvas.getContext('2d');
    let mW, mH;

    function resizeMystic() {
      mW = mysticCanvas.width  = mysticCanvas.offsetWidth;
      mH = mysticCanvas.height = mysticCanvas.offsetHeight;
    }
    resizeMystic();
    window.addEventListener('resize', resizeMystic, { passive: true });

    // Soft drifting firefly particles
    const fireflies = Array.from({ length: 90 }, () => ({
      x:  Math.random() * 1920,
      y:  Math.random() * 1080,
      size: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.08 - Math.random() * 0.35,  // drift gently upward
      opacity:   Math.random(),
      oDir:      Math.random() > 0.5 ? 1 : -1,
      oSpeed:    0.003 + Math.random() * 0.007,
      hue:       248 + Math.random() * 55,  // purple-violet range
    }));

    function drawMystic() {
      mc.clearRect(0, 0, mW, mH);

      fireflies.forEach(f => {
        // update
        f.x += f.vx;
        f.y += f.vy;
        f.opacity += f.oDir * f.oSpeed;
        if (f.opacity >= 1 || f.opacity <= 0) f.oDir *= -1;

        // wrap
        if (f.y < -8)     { f.y = mH + 8;  f.x = Math.random() * mW; }
        if (f.x < -8)     { f.x = mW + 8; }
        if (f.x > mW + 8) { f.x = -8; }

        const a = f.opacity * 0.55;

        // core dot
        mc.beginPath();
        mc.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        mc.fillStyle = `hsla(${f.hue},75%,82%,${a})`;
        mc.fill();

        // halo glow
        const grd = mc.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 7);
        grd.addColorStop(0,   `hsla(${f.hue},70%,75%,${a * 0.38})`);
        grd.addColorStop(1,   `hsla(${f.hue},70%,75%,0)`);
        mc.beginPath();
        mc.arc(f.x, f.y, f.size * 7, 0, Math.PI * 2);
        mc.fillStyle = grd;
        mc.fill();
      });

      requestAnimationFrame(drawMystic);
    }
    drawMystic();
  }

  /* ══════════ 7. FLASH LIGHTNING CANVAS ══════════ */
  const lightCanvas = document.getElementById('lightning-canvas');
  if (lightCanvas) {
    const lc = lightCanvas.getContext('2d');
    let lW, lH;

    function resizeLight() {
      lW = lightCanvas.width  = lightCanvas.offsetWidth;
      lH = lightCanvas.height = lightCanvas.offsetHeight;
    }
    resizeLight();
    window.addEventListener('resize', resizeLight, { passive: true });

    function drawLightning(x1, y1, x2, y2, depth, alpha) {
      if (depth === 0) return;
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 60 / depth;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 40 / depth;
      lc.beginPath();
      lc.moveTo(x1, y1); lc.lineTo(mx, my); lc.lineTo(x2, y2);
      lc.strokeStyle = `rgba(255,215,0,${alpha})`;
      lc.lineWidth = depth * 0.8;
      lc.stroke();
      if (Math.random() > 0.5 && depth > 1) {
        drawLightning(mx, my, mx + (Math.random()-0.5)*100, my + (Math.random()+0.5)*80, depth-1, alpha*0.6);
      }
      drawLightning(x1, y1, mx, my, depth-1, alpha * 0.7);
      drawLightning(mx, my, x2, y2, depth-1, alpha * 0.7);
    }

    let flashTimer = 0;
    function animateFlash() {
      lc.clearRect(0, 0, lW, lH);

      // Speed lines background
      for (let i = 0; i < 30; i++) {
        const y = (i / 30) * lH;
        const len = 50 + Math.random() * 150;
        const x = Math.random() * lW;
        lc.beginPath();
        lc.moveTo(x, y); lc.lineTo(x - len, y);
        lc.strokeStyle = `rgba(255,215,0,${0.02 + Math.random() * 0.04})`;
        lc.lineWidth = 1;
        lc.stroke();
      }

      // Periodic lightning strike
      flashTimer++;
      if (flashTimer % 120 < 5) {
        const x1 = Math.random() * lW;
        drawLightning(x1, 0, x1 + (Math.random()-0.5)*200, lH, 4, 0.6);
      }

      requestAnimationFrame(animateFlash);
    }
    animateFlash();
  }

  /* ══════════ 8. VENOM CANVAS ══════════ */
  const venomCanvas = document.getElementById('venom-canvas');
  if (venomCanvas) {
    const vc = venomCanvas.getContext('2d');
    let vW, vH;

    function resizeVenom() {
      vW = venomCanvas.width  = venomCanvas.offsetWidth;
      vH = venomCanvas.height = venomCanvas.offsetHeight;
    }
    resizeVenom();
    window.addEventListener('resize', resizeVenom, { passive: true });

    const venomNodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * 1920, y: Math.random() * 900,
      vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
      r: 1 + Math.random() * 2,
    }));

    let venomMX = vW/2, venomMY = vH/2;
    venomCanvas.addEventListener('mousemove', e => {
      const r = venomCanvas.getBoundingClientRect();
      venomMX = e.clientX - r.left; venomMY = e.clientY - r.top;
    });

    function drawVenom() {
      vc.clearRect(0, 0, vW, vH);

      venomNodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > vW) n.vx *= -1;
        if (n.y < 0 || n.y > vH) n.vy *= -1;

        // Draw node
        vc.beginPath();
        vc.arc(n.x, n.y, n.r, 0, Math.PI*2);
        vc.fillStyle = 'rgba(139,0,255,0.4)';
        vc.fill();
      });

      // Connections
      venomNodes.forEach((a, i) => {
        venomNodes.slice(i+1).forEach(b => {
          const d = Math.hypot(a.x-b.x, a.y-b.y);
          if (d < 120) {
            const alpha = (1 - d/120) * 0.3;
            vc.beginPath();
            vc.strokeStyle = `rgba(139,0,255,${alpha})`;
            vc.lineWidth = 0.5;
            vc.moveTo(a.x,a.y); vc.lineTo(b.x,b.y); vc.stroke();
          }
        });
        // Mouse
        const dm = Math.hypot(a.x-venomMX, a.y-venomMY);
        if (dm < 150) {
          vc.beginPath();
          vc.strokeStyle = `rgba(180,0,255,${(1-dm/150)*0.7})`;
          vc.lineWidth = 1.5;
          vc.moveTo(a.x,a.y); vc.lineTo(venomMX,venomMY); vc.stroke();
        }
      });

      // Ink blobs
      const t = Date.now()/1000;
      [0.2,0.5,0.8].forEach((px,i) => {
        vc.beginPath();
        vc.arc(vW*px, vH*(0.3+Math.sin(t+i)*0.1), 60+Math.sin(t*0.7+i)*20, 0, Math.PI*2);
        vc.fillStyle = `rgba(80,0,160,0.05)`;
        vc.fill();
      });

      requestAnimationFrame(drawVenom);
    }
    drawVenom();
  }

  /* ══════════ 9. INTERSECTION OBSERVER ══════════ */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');

      // Progress bars
      el.querySelectorAll('.mc-bar[data-width]').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      el.querySelectorAll('.fsb-fill[data-pct]').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.spidey-card, .mission-item, .flash-card, .venom-card, .micro-card').forEach((el, i) => {
    const delay = el.dataset.delay || 0;
    el.style.transitionDelay = delay + 'ms';
    observer.observe(el);
  });

  /* ══════════ 10. COUNTER ANIMATION ══════════ */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur = 2000;
      const start = performance.now();

      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + '+';
      })(performance.now());
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });

/* ==========================================================
   MICROINTERACTIONS LOGIC
   ========================================================== */
document.querySelectorAll('.micro-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

document.querySelectorAll('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) - rect.width / 2;
    const y = (e.clientY - rect.top) - rect.height / 2;
    // Move element slightly towards the mouse (strength = 0.3)
    el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = `translate(0px, 0px)`;
  });
});

  document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

  /* ══════════ 11. BENTO AURORA — SHINE + INTERACTIONS ══════════ */

  // Mouse-tracking shine for each bento card
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--bx', `${x}%`);
      card.style.setProperty('--by', `${y}%`);
    });
  });

  // GitHub bars — generate fake contribution data, animate on scroll
  const ghBarsEl = document.getElementById('gh-bars');
  if (ghBarsEl) {
    const weeks = 26;
    const heights = Array.from({ length: weeks }, () => 20 + Math.random() * 80);
    ghBarsEl.innerHTML = heights
      .map((h, i) => `<div class="gh-bar" style="height:${h}%;transition-delay:${i * 30}ms"></div>`)
      .join('');

    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      ghBarsEl.querySelectorAll('.gh-bar').forEach(b => b.classList.add('animated'));
    }, { threshold: 0.4 }).observe(ghBarsEl);
  }

  // Streak counter animation
  const streakEls = document.querySelectorAll('.streak-num[data-count]');
  if (streakEls.length) {
    const streakObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 1800, start = performance.now();
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        })(performance.now());
        streakObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    streakEls.forEach(el => streakObs.observe(el));
  }

  // LeetCode ring animation — new bento ring (circumference = 2πr = 314)
  const lcArc = document.getElementById('lc-venom-arc');
  const lcNum = document.getElementById('lc-venom-num');

  if (lcArc && lcNum) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const total = 350, max = 700, circum = 314;
      const offset = circum - (total / max * circum);
      lcArc.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.16,1,0.3,1)';
      lcArc.style.strokeDashoffset = offset;

      const dur = 2200, start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        lcNum.textContent = Math.round(eased * total);
        if (p < 1) requestAnimationFrame(tick);
        else lcNum.textContent = total;
      })(performance.now());
    }, { threshold: 0.5 }).observe(lcArc);
  }

  /* ══════════ 12. CARD MAGNETIC TILT ══════════ */
  document.querySelectorAll('.spidey-card, .venom-card, .mission-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / (r.width/2);
      const dy = (e.clientY - cy) / (r.height/2);
      card.style.transform = `perspective(700px) rotateY(${dx*6}deg) rotateX(${-dy*6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s cubic-bezier(0.16,1,0.3,1)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });

  /* ══════════ 13. SMOOTH NAV SCROLL ══════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ══════════ 14. IRON MAN CARD SCAN EFFECT ══════════ */
  document.querySelectorAll('.flash-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.setProperty('--scan-x', '0%');
    });
  });

  /* ══════════ 15. HERO BAT LOGO PARALLAX ══════════ */
  const batSignal = document.querySelector('.bat-signal-wrapper');
  if (batSignal) {
    document.addEventListener('mousemove', e => {
      const px = (e.clientX / window.innerWidth  - 0.5) * 30;
      const py = (e.clientY / window.innerHeight - 0.5) * 20;
      batSignal.style.transform = `translateX(calc(-50% + ${px}px)) translateY(${py}px)`;
    }, { passive: true });
  }

  /* ══════════ 16. CINEMATIC FRAME — SUBJECT REVEAL ══════════ */
  (function initCinematicFrame() {
    const frame    = document.getElementById('cinema-frame');
    const labelEl  = document.getElementById('cf-label');
    const textEl   = document.getElementById('cf-text');
    const dots     = Array.from(document.querySelectorAll('.cf-dot'));
    const counterEl= document.getElementById('cf-counter');
    if (!frame || !textEl) return;

    // Full B.Tech sequence ────────────────────────────────────────────────────
    //  isYear: true  →  big year card (shorter hold)
    //  isYear: false →  subject text
    const seq = [
      { isYear: true,  year: 0, label: '',                          text: '2021'                          },
      { isYear: false, year: 0, label: '2021  ·  Year One',         text: 'Programming in C'              },
      { isYear: false, year: 0, label: '2021  ·  Year One',         text: 'Calculus & Algebra'            },
      { isYear: false, year: 0, label: '2021  ·  Year One',         text: 'Engineering Physics'           },
      { isYear: false, year: 0, label: '2021  ·  Year One',         text: 'Engineering Graphics'          },
      { isYear: false, year: 0, label: '2021  ·  Year One',         text: 'Mechanics'                     },

      { isYear: true,  year: 1, label: '',                          text: '2022'                          },
      { isYear: false, year: 1, label: '2022  ·  Year Two',         text: 'Data Structures & Algorithms'  },
      { isYear: false, year: 1, label: '2022  ·  Year Two',         text: 'OOP — Java & C++'              },
      { isYear: false, year: 1, label: '2022  ·  Year Two',         text: 'Discrete Mathematics'          },
      { isYear: false, year: 1, label: '2022  ·  Year Two',         text: 'Database Management'           },
      { isYear: false, year: 1, label: '2022  ·  Year Two',         text: 'Computer Organization'         },

      { isYear: true,  year: 2, label: '',                          text: '2023'                          },
      { isYear: false, year: 2, label: '2023  ·  Year Three',       text: 'Design & Analysis of Algorithms'},
      { isYear: false, year: 2, label: '2023  ·  Year Three',       text: 'Computer Networks'             },
      { isYear: false, year: 2, label: '2023  ·  Year Three',       text: 'Software Engineering'          },
      { isYear: false, year: 2, label: '2023  ·  Year Three',       text: 'Theory of Computation'         },
      { isYear: false, year: 2, label: '2023  ·  Year Three',       text: 'Artificial Intelligence'       },
      { isYear: false, year: 2, label: '2023  ·  Year Three',       text: 'Web Technologies'              },

      { isYear: true,  year: 3, label: '',                          text: '2024'                          },
      { isYear: false, year: 3, label: '2024  ·  Year Four',        text: 'Distributed Systems'           },
      { isYear: false, year: 3, label: '2024  ·  Year Four',        text: 'Cryptography & Security'       },
      { isYear: false, year: 3, label: '2024  ·  Year Four',        text: 'Cloud Computing'               },
      { isYear: false, year: 3, label: '2024  ·  Year Four',        text: 'Machine Learning'              },
      { isYear: false, year: 3, label: '2024  ·  Year Four',        text: 'Big Data Analytics'            },
      { isYear: false, year: 3, label: '2024  ·  Year Four',        text: 'Capstone Project'              },
    ];

    const TOTAL_SUBJECTS = seq.filter(s => !s.isYear).length;
    let idx = 0, subIdx = 0, started = false;
    const FADE = 320;   // ms for fade in/out
    const HOLD_YEAR = 1500;
    const HOLD_SUB  = 1200;

    function show(item) {
      // --- fade out ---
      textEl.classList.remove('visible');
      labelEl.classList.add('fading');

      setTimeout(() => {
        // swap content
        if (item.isYear) {
          textEl.className = 'cf-text is-year';
          labelEl.textContent = '';
        } else {
          subIdx++;
          textEl.className = 'cf-text';
          labelEl.textContent = item.label;
          if (counterEl) counterEl.textContent =
            String(subIdx).padStart(2,'0') + ' / ' + String(TOTAL_SUBJECTS).padStart(2,'0');
        }
        textEl.textContent = item.text;

        // update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === item.year));

        // --- fade in ---
        labelEl.classList.remove('fading');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => textEl.classList.add('visible'));
        });
      }, FADE);
    }

    function next() {
      if (idx >= seq.length) { idx = 0; subIdx = 0; }
      const item = seq[idx++];
      show(item);
      const hold = item.isYear ? HOLD_YEAR : HOLD_SUB;
      setTimeout(next, hold + FADE);
    }

    // Trigger once cinema frame enters viewport ──────────────────────────────
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true;
        setTimeout(next, 500);
        obs.disconnect();
      }
    }, { threshold: 0.35 });

    obs.observe(frame);
  })();

})();

