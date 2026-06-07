/* ═══════════════════════════════════════════════════════
   SACHIN SINGH — SUPERHERO PORTFOLIO JS
   Animations: Batman Rain | Spider-Man Web | Iron Man HUD
                Flash Lightning | Venom Tendrils + all reveals
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════ 1. NATIVE CURSOR RESTORED ══════════ */
  let mx = -200, my = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
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
        
        // Map all section IDs to the Batman theme sound for perfect consistency
        const heroMap = {
          home: 'batman',
          projects: 'batman',
          journey: 'batman',
          arsenal: 'batman',
          activities: 'batman',
          connect: 'batman',
          profiles: 'batman'
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
      journey: '#00d4ff', arsenal: '#FFD700', activities: '#FFD700', profiles: '#8b00ff'
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

  /* ══════════ 6. MYSTIC PORTAL & COSMIC RUNES CANVAS ══════════ */
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

    // Track mouse coordinates to power dynamic resonance
    let mX = -1000, mY = -1000;
    let resonance = 0.15; // default rest state
    
    document.addEventListener('mousemove', e => {
      const r = mysticCanvas.getBoundingClientRect();
      // Only track if mouse is close to the section
      if (e.clientY >= r.top - 300 && e.clientY <= r.bottom + 300) {
        mX = e.clientX - r.left;
        mY = e.clientY - r.top;
      } else {
        mX = -1000; mY = -1000;
      }
    }, { passive: true });

    // Golden runic embers/sparks flying radially outward
    const sparks = [];
    const maxSparks = 100;

    function spawnSpark(cx, cy, intensity) {
      if (sparks.length >= maxSparks) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.5 * (1 + intensity * 2.0);
      sparks.push({
        x: cx + Math.cos(angle) * 120,
        y: cy + Math.sin(angle) * 120,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.4 - 0.25, // slight upward drift
        size: 0.8 + Math.random() * 2.2,
        life: 1.0,
        decay: 0.006 + Math.random() * 0.012,
        hue: 38 + Math.random() * 15 // warm gold-amber HSL range
      });
    }

    let rot1 = 0, rot2 = 0, rot3 = 0;

    function drawMystic() {
      mc.clearRect(0, 0, mW, mH);

      const cx = mW / 2;
      const cy = mH / 2;

      // 1. Calculate dynamic interactive resonance
      let targetRes = 0.15;
      if (mX !== -1000) {
        const dist = Math.hypot(mX - cx, mY - cy);
        targetRes = Math.max(0.15, 1.0 - dist / 700);
      }
      resonance += (targetRes - resonance) * 0.08; // smooth interpolation

      // 2. Rotate portal rings based on resonance
      rot1 += 0.003 * (1 + resonance * 4.0);
      rot2 -= 0.005 * (1 + resonance * 3.5);
      rot3 += 0.001 * (1 + resonance * 5.0);

      // 3. Draw ambient core portal glow
      const portalGlow = mc.createRadialGradient(cx, cy, 50, cx, cy, 320 * (0.8 + resonance * 0.4));
      portalGlow.addColorStop(0, `hsla(42, 100%, 65%, ${0.12 * resonance})`);
      portalGlow.addColorStop(0.3, `hsla(38, 100%, 55%, ${0.05 * resonance})`);
      portalGlow.addColorStop(1, 'rgba(4, 4, 7, 0)');
      mc.beginPath();
      mc.arc(cx, cy, 320 * (0.8 + resonance * 0.4), 0, Math.PI * 2);
      mc.fillStyle = portalGlow;
      mc.fill();

      // 4. Draw Rotating Runes & Telemetry Circles
      mc.lineWidth = 1.2;
      
      // Ring 1 (Inner dashed tracking ring)
      mc.save();
      mc.translate(cx, cy);
      mc.rotate(rot1);
      mc.beginPath();
      mc.arc(0, 0, 180, 0, Math.PI * 2);
      mc.setLineDash([20, 15, 4, 15]);
      mc.strokeStyle = `hsla(42, 100%, 65%, ${0.08 + resonance * 0.18})`;
      mc.stroke();
      
      // Draw inner decorative anchors
      for (let i = 0; i < 4; i++) {
        mc.rotate(Math.PI / 2);
        mc.beginPath();
        mc.moveTo(0, -170);
        mc.lineTo(-10, -180);
        mc.lineTo(10, -180);
        mc.closePath();
        mc.fillStyle = `hsla(42, 100%, 65%, ${0.1 + resonance * 0.22})`;
        mc.fill();
      }
      mc.restore();

      // Ring 2 (Middle thick runic dash ring)
      mc.save();
      mc.translate(cx, cy);
      mc.rotate(rot2);
      mc.beginPath();
      mc.arc(0, 0, 240, 0, Math.PI * 2);
      mc.setLineDash([45, 12, 10, 12, 45, 20]);
      mc.lineWidth = 2;
      mc.strokeStyle = `hsla(38, 100%, 55%, ${0.06 + resonance * 0.22})`;
      mc.stroke();
      mc.restore();

      // Ring 3 (Outer planetary orbital ring with glyph points)
      mc.save();
      mc.translate(cx, cy);
      mc.rotate(rot3);
      mc.beginPath();
      mc.arc(0, 0, 310, 0, Math.PI * 2);
      mc.setLineDash([100, 25, 10, 25]);
      mc.lineWidth = 1.0;
      mc.strokeStyle = `hsla(38, 100%, 60%, ${0.04 + resonance * 0.15})`;
      mc.stroke();

      // Outer glowing runes/ticks
      const tickCount = 12;
      for (let i = 0; i < tickCount; i++) {
        const angle = (Math.PI * 2 / tickCount) * i;
        const tx = Math.cos(angle) * 310;
        const ty = Math.sin(angle) * 310;
        
        mc.beginPath();
        mc.arc(tx, ty, 3 + resonance * 2, 0, Math.PI * 2);
        mc.fillStyle = `hsla(42, 100%, 65%, ${0.12 + resonance * 0.35})`;
        mc.fill();
        
        // draw a small radial beam from each glyph pointing inward
        mc.beginPath();
        mc.moveTo(tx, ty);
        mc.lineTo(tx * 0.95, ty * 0.95);
        mc.strokeStyle = `hsla(42, 100%, 65%, ${0.08 + resonance * 0.2})`;
        mc.stroke();
      }
      mc.restore();

      // 5. Spawn and render runic sparks/embers
      if (Math.random() < 0.3 + resonance * 0.6) {
        spawnSpark(cx, cy, resonance);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        const alpha = s.life * (0.3 + resonance * 0.6);
        
        // Render spark
        mc.beginPath();
        mc.arc(s.x, s.y, s.size * (0.5 + s.life * 0.5), 0, Math.PI * 2);
        mc.fillStyle = `hsla(${s.hue}, 95%, 72%, ${alpha})`;
        mc.fill();

        // Spark halo glow
        mc.beginPath();
        mc.arc(s.x, s.y, s.size * 3 * s.life, 0, Math.PI * 2);
        mc.fillStyle = `hsla(${s.hue}, 95%, 72%, ${alpha * 0.22})`;
        mc.fill();
      }

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

    // Track mouse position over the activities section
    let mX = -1000, mY = -1000;
    let hoveredCard = null;

    document.addEventListener('mousemove', e => {
      const r = lightCanvas.getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right) {
        mX = e.clientX - r.left;
        mY = e.clientY - r.top;
      } else {
        mX = -1000; mY = -1000;
      }
    }, { passive: true });

    // Attach card hover trackers to select target anchors
    document.querySelectorAll('.flash-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        hoveredCard = card;
      });
      card.addEventListener('mouseleave', () => {
        hoveredCard = null;
      });
    });

    function drawLightning(x1, y1, x2, y2, depth, alpha) {
      if (depth === 0) return;
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 80 / depth;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 60 / depth;
      
      lc.beginPath();
      lc.moveTo(x1, y1); lc.lineTo(mx, my); lc.lineTo(x2, y2);
      lc.strokeStyle = `rgba(255, 220, 50, ${alpha})`;
      lc.lineWidth = depth * 0.9;
      lc.shadowColor = 'rgba(255, 215, 0, 0.8)';
      lc.shadowBlur = depth * 3.5;
      lc.stroke();
      lc.shadowBlur = 0; // reset for performance

      if (Math.random() > 0.6 && depth > 1) {
        // fork branch
        drawLightning(mx, my, mx + (Math.random() - 0.5) * 120, my + (Math.random() + 0.2) * 90, depth - 1, alpha * 0.5);
      }
      drawLightning(x1, y1, mx, my, depth - 1, alpha * 0.72);
      drawLightning(mx, my, x2, y2, depth - 1, alpha * 0.72);
    }

    let flashTimer = 0;

    function animateFlash() {
      lc.clearRect(0, 0, lW, lH);

      // Speed lines background
      for (let i = 0; i < 30; i++) {
        const y = (i / 30) * lH;
        const len = 60 + Math.random() * 180;
        const x = Math.random() * lW;
        lc.beginPath();
        lc.moveTo(x, y); lc.lineTo(x - len, y);
        lc.strokeStyle = `rgba(255, 215, 0, ${0.02 + Math.random() * 0.04})`;
        lc.lineWidth = 1;
        lc.stroke();
      }

      // 1. Dynamic Cursor Snapping Lightning
      if (mX !== -1000) {
        if (Math.random() < 0.35) {
          // snap from random screen edge to cursor
          const edge = Math.floor(Math.random() * 4);
          let startX = 0, startY = 0;
          if (edge === 0) { startX = Math.random() * lW; startY = 0; } // Top
          else if (edge === 1) { startX = lW; startY = Math.random() * lH; } // Right
          else if (edge === 2) { startX = Math.random() * lW; startY = lH; } // Bottom
          else { startX = 0; startY = Math.random() * lH; } // Left

          drawLightning(startX, startY, mX, mY, 4, 0.75);
          
          // Draw small snap contact flash
          lc.beginPath();
          lc.arc(mX, mY, 4 + Math.random() * 5, 0, Math.PI * 2);
          lc.fillStyle = '#ffffff';
          lc.fill();
        }
      }

      // 2. High-Voltage Hovered Card Discharges
      if (hoveredCard) {
        const r = hoveredCard.getBoundingClientRect();
        const cr = lightCanvas.getBoundingClientRect();
        
        // Find card bounds relative to canvas
        const cardX1 = r.left - cr.left;
        const cardY1 = r.top - cr.top;
        const cardWidth = r.width;
        const cardHeight = r.height;

        const targetX = cardX1 + cardWidth / 2;
        const targetY = cardY1 + cardHeight / 2;

        if (Math.random() < 0.45) {
          // Shoot a discharge bolt from one of the canvas corners towards the hovered card center!
          const corners = [
            {x: 0, y: 0},
            {x: lW, y: 0},
            {x: 0, y: lH},
            {x: lW, y: lH}
          ];
          const c = corners[Math.floor(Math.random() * 4)];
          
          // Crackle directly into the card center
          drawLightning(c.x, c.y, targetX, targetY, 4, 0.85);

          // Draw neon bounding box pulses around the active hovered card
          lc.strokeStyle = 'rgba(255, 215, 0, 0.4)';
          lc.lineWidth = 2.0;
          lc.strokeRect(cardX1 - 2, cardY1 - 2, cardWidth + 4, cardHeight + 4);
        }
      }

      // 3. Periodic ambient lightning strike
      flashTimer++;
      if (flashTimer % 140 < 6) {
        const x1 = Math.random() * lW;
        drawLightning(x1, 0, x1 + (Math.random() - 0.5) * 200, lH, 4, 0.55);
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

  document.querySelectorAll('.spidey-card, .mission-item, .flash-card, .venom-card, .micro-card, .arsenal-card').forEach((el, i) => {
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

  /* ══════════ 16. JOURNEY TIMELINE — SCROLL CHAPTER REVEAL ══════════ */
  (function initJourneyTimeline() {
    const track = document.getElementById('journey-track');
    const wrap  = document.getElementById('journey-track-wrap');
    const dots  = document.querySelectorAll('#journey-dots .jy-dot');
    if (!track || !wrap) return;

    const chapters = track.querySelectorAll('.jy-chapter');
    let activeChapter = 0;
    let hasRevealed = new Set();

    // ── Reveal chapter cards + fill bars ──
    function revealChapter(chapter, idx) {
      if (hasRevealed.has(idx)) return;
      hasRevealed.add(idx);

      chapter.classList.add('jy-revealed');

      // Fill mastery bars after a short delay
      chapter.querySelectorAll('.jy-bar-fill').forEach(bar => {
        const w = parseInt(bar.dataset.w) || 0;
        bar.style.width = w + '%';
      });
    }

    // ── Update active dot ──
    function setActiveDot(i) {
      dots.forEach((d, di) => d.classList.toggle('active', di === i));
      activeChapter = i;
    }

    // ── Scroll listener: detect which chapter is in view ──
    function onScroll() {
      const tw = track.clientWidth;
      const sx = track.scrollLeft;
      const ci = Math.round(sx / tw);
      if (ci !== activeChapter) setActiveDot(ci);
    }
    track.addEventListener('scroll', onScroll, { passive: true });

    // ── Dot click → snap to chapter ──
    dots.forEach((dot, di) => {
      dot.addEventListener('click', () => {
        track.scrollTo({ left: di * track.clientWidth, behavior: 'smooth' });
        setActiveDot(di);
      });
    });

    // ── Intersection Observer for each chapter ──
    const chapterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = [...chapters].indexOf(entry.target);
        revealChapter(entry.target, idx);
      });
    }, { threshold: 0.3, root: track });

    chapters.forEach(ch => chapterObs.observe(ch));

    // ── Section scroll into viewport → reveal chapter 0 ──
    const sectionObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        revealChapter(chapters[0], 0);
        sectionObs.disconnect();
      }
    }, { threshold: 0.2 });
    const journeySection = document.getElementById('journey');
    if (journeySection) sectionObs.observe(journeySection);

    // ── Keyboard arrow navigation ──
    document.addEventListener('keydown', e => {
      const section = document.getElementById('journey');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      if (e.key === 'ArrowRight') {
        const next = Math.min(activeChapter + 1, chapters.length - 1);
        track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
        setActiveDot(next);
      } else if (e.key === 'ArrowLeft') {
        const prev = Math.max(activeChapter - 1, 0);
        track.scrollTo({ left: prev * track.clientWidth, behavior: 'smooth' });
        setActiveDot(prev);
      }
    });

    // ── Card tilt on hover ──
    chapters.forEach(chapter => {
      chapter.querySelectorAll('.jy-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const dx = (e.clientX - r.left) / r.width - 0.5;
          const dy = (e.clientY - r.top)  / r.height - 0.5;
          card.style.transform = `translateY(-4px) perspective(600px) rotateX(${-dy*5}deg) rotateY(${dx*5}deg)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    });
  })();


})();


/* ══════════ 17. HERO PHOTO 3D TILT ══════════ */
(function initPhotoTilt() {
  const photoFrame = document.getElementById('photo-tilt');
  if (!photoFrame) return;
  // Support both old .photo-orbit and new .photo-portal wrapper class
  const photoOrbit = photoFrame.closest('.photo-orbit') || photoFrame.closest('.photo-portal');

  photoFrame.addEventListener('mousemove', e => {
    const r = photoFrame.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2))  / (r.width / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    photoFrame.style.transform = `perspective(600px) rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg) scale(1.04)`;
    photoFrame.style.transition = 'transform 0.1s ease';
  });
  photoFrame.addEventListener('mouseleave', () => {
    photoFrame.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    photoFrame.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
  });

  const heroSection = document.getElementById('home');
  if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const r = heroSection.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width  - 0.5) * 20;
      const py = ((e.clientY - r.top)  / r.height - 0.5) * 15;
      if (photoOrbit) {
        photoOrbit.style.transform = `translate(${px}px, ${py}px)`;
        photoOrbit.style.transition = 'transform 0.4s ease';
      }
    }, { passive: true });
    heroSection.addEventListener('mouseleave', () => {
      if (photoOrbit) {
        photoOrbit.style.transform = '';
        photoOrbit.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
      }
    });
  }
})();

/* ==========================================================
   BATCOMPUTER COMMAND TERMINAL & DYNAMIC REFRESH PROTOCOLS
   ========================================================== */
(function initCavernExtras() {
  'use strict';

  /* ── 1. BATCOMPUTER TERMINAL DRAWER ── */
  const toggleBtn = document.getElementById('term-toggle');
  const terminal  = document.getElementById('bat-terminal');
  const closeBtn  = document.getElementById('term-close-btn');
  const termInput = document.getElementById('term-input');
  const termOutput = document.getElementById('term-output');

  if (toggleBtn && terminal && termInput && termOutput) {
    toggleBtn.addEventListener('click', () => {
      terminal.classList.toggle('active');
      if (terminal.classList.contains('active')) {
        setTimeout(() => termInput.focus(), 150);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        terminal.classList.remove('active');
      });
    }

    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = termInput.value.trim().toLowerCase();
        termInput.value = '';
        if (cmd) {
          handleCommand(cmd);
        }
      }
    });

    function printLine(text, type = '') {
      const line = document.createElement('div');
      line.className = 'term-line ' + type;
      line.innerHTML = text;
      termOutput.appendChild(line);
      
      const body = document.getElementById('term-body');
      if (body) {
        body.scrollTop = body.scrollHeight;
      }
    }

    function handleCommand(cmd) {
      printLine(`BAT-SYS:~$ ${cmd}`, 'prompt-echo');

      switch (cmd) {
        case 'help':
          printLine('Available cavern commands:<br>' +
            '- <strong style="color:#ffb900;">about</strong>: Background profile dossier<br>' +
            '- <strong style="color:#ffb900;">skills</strong>: Core programming gear & tech stats<br>' +
            '- <strong style="color:#ffb900;">projects</strong>: Decrypted tactical repositories<br>' +
            '- <strong style="color:#ffb900;">contact</strong>: Establish secure connection lines<br>' +
            '- <strong style="color:#ffb900;">clear</strong>: Wipe terminal logs');
          break;
        case 'about':
          printLine('SUBJECT: Sachin Singh<br>' +
            'ROLE: Software Engineer & Full Stack Web Developer<br>' +
            'BIO: Precision developer deploying high-performance apps under the shadows of night. Built secure auths, real-time engines, and retro canvas runners.');
          break;
        case 'skills':
          printLine('THE SKILLS PROTOCOLS:<br>' +
            '- Languages: JS/TS (95%), Python (85%), C++ (80%), Java<br>' +
            '- Frontend: React, Next.js, HTML5/CSS3, Tailwind, Canvas<br>' +
            '- Backend: Node/Express, RESTful APIs, Postgres, Mongo, Redis<br>' +
            '- DevOps: Docker, Git, CI/CD, AWS, Linux');
          break;
        case 'projects':
          printLine('TACTICAL DEPLOYMENTS:<br>' +
            '- FILE_01: TypeNews — Live Typing News Portal (Next.js/Tailwind)<br>' +
            '- FILE_02: Algorithm visualizer engine (Canvas API)<br>' +
            '- FILE_03: Cryptographic JWT authentication (Node/Docker)');
          break;
        case 'contact':
          printLine('SECURE CHANNELS OPEN:<br>' +
            '- Email: <a href="mailto:sachin31033@gmail.com" style="color:#ffb900;">sachin31033@gmail.com</a><br>' +
            '- LinkedIn: <a href="https://www.linkedin.com/in/sachin-singh-29360423ss/" target="_blank" style="color:#ffb900;">linkedin.com/in/sachin-singh-29360423ss/</a><br>' +
            '- GitHub: <a href="https://github.com/Sachin2936" target="_blank" style="color:#ffb900;">github.com/Sachin2936</a>');
          break;
        case 'clear':
          termOutput.innerHTML = '';
          break;
        default:
          printLine(`Command not recognized: "${cmd}". Type <strong style="color:#ffb900;">help</strong> for support.`, 'system');
      }
    }
  }

  /* ── 2. LEETCODE DATABASE SYNC SIMULATION ── */
  const syncBtn = document.getElementById('lc-sync-btn');
  const numEl   = document.getElementById('lc-venom-num');
  const arcEl   = document.getElementById('lc-venom-arc');

  if (syncBtn && numEl && arcEl) {
    syncBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      
      const icon = syncBtn.querySelector('svg');
      if (icon) {
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => icon.style.transform = 'rotate(0deg)', 600);
      }

      numEl.textContent = '---';
      arcEl.style.strokeDashoffset = '314';

      setTimeout(() => {
        const total = 350, max = 700, circum = 314;
        const offset = circum - (total / max * circum);
        arcEl.style.strokeDashoffset = offset;

        const dur = 1500, start = performance.now();
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          numEl.textContent = Math.round(eased * total);
          if (p < 1) requestAnimationFrame(tick);
          else numEl.textContent = total;
        })(performance.now());
      }, 400);
    });
  }

  /* ── 3. 3D PERSPECTIVE BENTO CARD HOVER EFFECTS ── */
  document.querySelectorAll('.bento-card, .flash-card, .arsenal-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const px = (x / r.width - 0.5) * 14;
      const py = (y / r.height - 0.5) * -14;
      
      card.style.transform = `perspective(800px) rotateX(${py}deg) rotateY(${px}deg) translateY(-4px)`;
      card.style.boxShadow = `0 15px 35px rgba(0,0,0,0.65), 0 0 25px hsla(var(--neon-glow-h, 45), 100%, 50%, 0.18)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
})();
