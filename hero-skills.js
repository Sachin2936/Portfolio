/* =========================================================================
   HERO SKILLS — 3D QUANTUM REACTOR CAROUSEL
   
   Features:
   1. Interactive 3D Turntable rotation with dragging physics & snapped angles.
   2. Diagnostic progression triggers: progress bars fill when card enters front-focus.
   3. Central Animated Fusion Core color transitions.
   4. High-fidelity Canvas plasma laser streams & charging particles.
   5. Interactive Command Console buttons & real-time telemetry screen.
   6. Draggable Rotational Override Wheel in the HUD panel.
   ========================================================================= */

(function () {
  'use strict';

  // Core colors mapping
  const CORES = [
    { name: "LANGUAGES", color: "#4fc3f7", rgb: "79, 195, 247" },
    { name: "FRONTEND", color: "#4caf50", rgb: "76, 175, 80" },
    { name: "BACKEND", color: "#b388ff", rgb: "179, 136, 255" },
    { name: "DEVOPS", color: "#ffb300", rgb: "255, 179, 0" }
  ];

  /* ─────────────── CAROUSEL MAIN ENGINE ─────────────── */
  function initQuantumCarousel() {
    const container = document.getElementById('hsk-carousel-container');
    const turntable = document.getElementById('hsk-carousel-turntable');
    const panels = document.querySelectorAll('.hsk-panel');
    const fusionCore = document.getElementById('hsk-fusion-core');
    const consoleBtns = document.querySelectorAll('.hsk-console-btn');
    const telDeg = document.getElementById('hsk-tel-deg');
    const telYaw = document.getElementById('hsk-tel-yaw');
    const telStatus = document.getElementById('hsk-tel-status');
    const overrideWheel = document.getElementById('hsk-override-wheel');
    const canvas = document.getElementById('hsk-plasma-canvas');
    const ambientGlow = document.getElementById('hsk-ambient-glow');

    if (!container || !turntable || panels.length === 0) return;

    let activeIndex = 0;
    let currentAngle = 0; // current visual angle
    let targetAngle = 0;  // snapped target angle

    // Dragging physics parameters
    let isDragging = false;
    let dragStartX = 0;
    let startAngle = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let dragCoefficient = 0.25; // Drag sensitivity
    let friction = 0.95; // Inertial decay friction

    // Wheel override dragging parameters
    let isWheelDragging = false;
    let wheelAngleOffset = 0;
    let currentWheelAngle = 0;
    let targetWheelAngle = 0;

    /* ─────────────── CARD STATE SYNCHRONIZATION ─────────────── */
    function updateActiveStates(idx) {
      activeIndex = ((idx % 4) + 4) % 4;

      // Update active/inactive classes on reactor panels
      panels.forEach((panel, pi) => {
        // Find relative index angle to maintain orientation facing the viewer
        panel.style.setProperty('--index-angle', `${pi * 90}deg`);

        if (pi === activeIndex) {
          if (!panel.classList.contains('active')) {
            panel.classList.add('active');
            panel.classList.remove('inactive');
            triggerSkillFills(panel);
          }
        } else {
          panel.classList.add('inactive');
          panel.classList.remove('active');
          resetSkillFills(panel);
        }
      });

      // Sync central fusion core & ambient background aura colors
      const activeCore = CORES[activeIndex];
      if (fusionCore) {
        fusionCore.style.setProperty('--hc', activeCore.color);
        fusionCore.style.setProperty('--hr', activeCore.rgb);
      }
      if (ambientGlow) {
        ambientGlow.style.setProperty('--hc', activeCore.color);
        ambientGlow.style.setProperty('--hr', activeCore.rgb);
      }

      // Sync Command Deck manual button states
      consoleBtns.forEach((btn, bi) => {
        if (bi === activeIndex) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Sync diagnostic status message
      if (telStatus) {
        telStatus.textContent = `ACTIVE - CORE 0${activeIndex + 1}`;
        telStatus.style.color = activeCore.color;
      }
    }

    // Trigger skills loading stagger
    function triggerSkillFills(panel) {
      // 1. Fill skill bars
      const bars = panel.querySelectorAll('.hsk-bar');
      bars.forEach((bar, bi) => {
        const target = parseInt(bar.dataset.w) || 0;
        setTimeout(() => {
          bar.style.width = target + '%';
        }, 150 + bi * 80);
      });

      // 2. Fill power output bar
      const powerFill = panel.querySelector('.hsk-power-fill');
      if (powerFill) {
        const targetPower = parseInt(powerFill.dataset.w) || 80;
        setTimeout(() => {
          powerFill.style.width = targetPower + '%';
        }, 400);
      }
    }

    // Reset skill bars to zero width when cards are blurred/inactive
    function resetSkillFills(panel) {
      const bars = panel.querySelectorAll('.hsk-bar');
      bars.forEach(bar => {
        bar.style.width = '0%';
      });

      const powerFill = panel.querySelector('.hsk-power-fill');
      if (powerFill) {
        powerFill.style.width = '0%';
      }
    }

    /* ─────────────── TURNTABLE ANGLE ROTATION ─────────────── */
    function setTurntableAngle(angle) {
      currentAngle = angle;
      turntable.style.setProperty('--rotate-deg', `${currentAngle}deg`);

      // Update card visual blending properties dynamically based on their relative angle
      panels.forEach((panel, pi) => {
        let diffAngle = currentAngle + pi * 90;
        let rad = (diffAngle * Math.PI) / 180;
        let cos = Math.cos(rad);

        // Soft uniform boundary scaling
        let opacity = 0;
        let scale = 0.82;
        let blur = 12;
        let bright = 0.35;

        if (cos > 0) {
          // Card is on the front side of the cylinder turntable ring
          opacity = 0.04 + 0.96 * Math.pow(cos, 1.8);
          scale = 0.82 + 0.22 * cos;
          blur = 12 * (1 - cos);
          bright = 0.35 + 0.65 * cos;
        } else {
          // Card is on the back side - fade to almost invisible to prevent box overlaps showing
          opacity = 0.02 * (1 + cos); 
          scale = 0.82 - 0.05 * Math.abs(cos);
          blur = 12;
          bright = 0.35 * (1 + cos);
        }

        panel.style.setProperty('--card-opacity', opacity);
        panel.style.setProperty('--card-scale', scale);
        panel.style.setProperty('--card-blur', `${blur.toFixed(2)}px`);
        panel.style.setProperty('--card-bright', bright.toFixed(3));
      });

      // Sync wheel rotation indicator
      if (overrideWheel && !isWheelDragging) {
        targetWheelAngle = -currentAngle;
        currentWheelAngle = currentWheelAngle * 0.85 + targetWheelAngle * 0.15;
        overrideWheel.style.setProperty('--wheel-deg', `${currentWheelAngle}deg`);
      }

      // Sync telemetry readouts
      if (telDeg) {
        let displayDeg = (currentAngle % 360);
        if (displayDeg < 0) displayDeg += 360;
        telDeg.textContent = `${displayDeg.toFixed(2)}°`;
      }
      if (telYaw) {
        let yawRad = (currentAngle * Math.PI) / 180;
        telYaw.textContent = `${yawRad.toFixed(3)} rad`;
      }
    }

    /* ─────────────── SNAP MECHANISM ─────────────── */
    function snapToCore() {
      // Snap to closest 90-degree radial offset
      let closestSnap = Math.round(currentAngle / 90) * 90;
      targetAngle = closestSnap;

      // Handle snapped active index update
      let rawIdx = Math.round(-targetAngle / 90);
      let snappedIdx = ((rawIdx % 4) + 4) % 4;

      // Trigger animations
      turntable.classList.add('snapping');
      setTurntableAngle(targetAngle);
      updateActiveStates(snappedIdx);

      setTimeout(() => {
        turntable.classList.remove('snapping');
      }, 600);
    }

    /* ─────────────── INTERACTION: SWIPE / DRAG ─────────────── */
    function handleDragStart(clientX) {
      isDragging = true;
      dragStartX = clientX;
      startAngle = currentAngle;
      lastX = clientX;
      lastTime = performance.now();
      velocity = 0;
      turntable.classList.remove('snapping');
    }

    function handleDragMove(clientX) {
      if (!isDragging) return;

      const deltaX = clientX - dragStartX;
      const targetDeltaAngle = deltaX * dragCoefficient;

      // Calculate instantaneous dragging velocity
      const now = performance.now();
      const dt = now - lastTime;
      const dx = clientX - lastX;

      if (dt > 0) {
        const instVelocity = (dx * dragCoefficient) / dt;
        velocity = velocity * 0.4 + instVelocity * 0.6; // smooth filtering
      }

      lastX = clientX;
      lastTime = now;

      // Rotate turntable instantly
      setTurntableAngle(startAngle + targetDeltaAngle);
    }

    function handleDragEnd() {
      if (!isDragging) return;
      isDragging = false;

      // Apply physics velocity push
      if (Math.abs(velocity) > 0.15) {
        let momentumAngle = currentAngle + velocity * 180; // project momentum forward
        let closestMomSnap = Math.round(momentumAngle / 90) * 90;
        
        // Prevent spinning more than one card away to ensure user control
        let maxDelta = 90;
        let snapDelta = closestMomSnap - currentAngle;
        if (Math.abs(snapDelta) > maxDelta) {
          closestMomSnap = Math.round(currentAngle / 90) * 90 + Math.sign(snapDelta) * 90;
        }

        targetAngle = closestMomSnap;
        turntable.classList.add('snapping');
        setTurntableAngle(targetAngle);
        
        let rawIdx = Math.round(-targetAngle / 90);
        updateActiveStates(rawIdx);

        setTimeout(() => {
          turntable.classList.remove('snapping');
        }, 650);
      } else {
        snapToCore();
      }
    }

    // Touch and mouse listeners for Carousel container
    container.addEventListener('mousedown', e => {
      if (e.target.closest('.hsk-panel.active') && !e.target.closest('.hsk-top-strip')) {
        // Let user highlight text/clicks inside active card content
        return;
      }
      e.preventDefault();
      handleDragStart(e.clientX);
    });

    window.addEventListener('mousemove', e => {
      if (isDragging) {
        handleDragMove(e.clientX);
      }
    });

    window.addEventListener('mouseup', handleDragEnd);

    // Touch events for mobile responsiveness
    container.addEventListener('touchstart', e => {
      if (e.target.closest('.hsk-panel.active') && !e.target.closest('.hsk-top-strip')) {
        return;
      }
      handleDragStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (isDragging) {
        handleDragMove(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', handleDragEnd);

    /* ─────────────── INTERACTION: HUD OVERRIDE WHEEL DRAG ─────────────── */
    if (overrideWheel) {
      function getAngle(clientX, clientY) {
        const rect = overrideWheel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      }

      overrideWheel.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        isWheelDragging = true;
        turntable.classList.remove('snapping');
        
        const startMouseAngle = getAngle(e.clientX, e.clientY);
        wheelAngleOffset = currentWheelAngle - startMouseAngle;
      });

      window.addEventListener('mousemove', e => {
        if (!isWheelDragging) return;
        
        const mouseAngle = getAngle(e.clientX, e.clientY);
        let absoluteAngle = mouseAngle + wheelAngleOffset;
        
        currentWheelAngle = absoluteAngle;
        overrideWheel.style.setProperty('--wheel-deg', `${currentWheelAngle}deg`);

        // Sync turntable rotation (inverse of wheel rotative displacement)
        setTurntableAngle(-currentWheelAngle);
      });

      window.addEventListener('mouseup', () => {
        if (isWheelDragging) {
          isWheelDragging = false;
          snapToCore();
        }
      });

      // Touch events for HUD override dial
      overrideWheel.addEventListener('touchstart', e => {
        e.stopPropagation();
        isWheelDragging = true;
        turntable.classList.remove('snapping');
        
        const touch = e.touches[0];
        const startMouseAngle = getAngle(touch.clientX, touch.clientY);
        wheelAngleOffset = currentWheelAngle - startMouseAngle;
      }, { passive: false });

      window.addEventListener('touchmove', e => {
        if (!isWheelDragging) return;
        const touch = e.touches[0];
        const mouseAngle = getAngle(touch.clientX, touch.clientY);
        let absoluteAngle = mouseAngle + wheelAngleOffset;
        
        currentWheelAngle = absoluteAngle;
        overrideWheel.style.setProperty('--wheel-deg', `${currentWheelAngle}deg`);
        setTurntableAngle(-currentWheelAngle);
      }, { passive: false });

      window.addEventListener('touchend', () => {
        if (isWheelDragging) {
          isWheelDragging = false;
          snapToCore();
        }
      });
    }

    /* ─────────────── INTERACTION: CONSOLE BUTTON CLICKS ─────────────── */
    consoleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index) || 0;
        
        // Snap directly to core position
        targetAngle = -idx * 90;
        
        // Find shortest path direction (prevent massive multi-spin loops)
        let diff = (targetAngle - currentAngle) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        targetAngle = currentAngle + diff;

        turntable.classList.add('snapping');
        setTurntableAngle(targetAngle);
        updateActiveStates(idx);

        setTimeout(() => {
          turntable.classList.remove('snapping');
        }, 600);
      });
    });

    // Inactive background card clicks snap to focus
    panels.forEach((panel, pi) => {
      panel.addEventListener('click', e => {
        if (panel.classList.contains('inactive')) {
          e.preventDefault();
          e.stopPropagation();
          
          targetAngle = -pi * 90;
          let diff = (targetAngle - currentAngle) % 360;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          
          targetAngle = currentAngle + diff;
          turntable.classList.add('snapping');
          setTurntableAngle(targetAngle);
          updateActiveStates(pi);

          setTimeout(() => {
            turntable.classList.remove('snapping');
          }, 600);
        }
      });
    });

    /* ─────────────── HIGH-ENERGY PLASMA CANVAS ENGINE ─────────────── */
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let animationFrameId;
      let width, height;
      let particleArray = [];

      function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      class PlasmaSpark {
        constructor(sx, sy, tx, ty, color) {
          this.x = sx;
          this.y = sy;
          this.targetX = tx;
          this.targetY = ty;
          this.color = color;
          this.speed = 1.5 + Math.random() * 2.5;
          this.size = 1 + Math.random() * 2.5;
          this.progress = 0;
          // Curve deviation for a lightning organic arc look
          this.waveOffset = Math.random() * 100;
          this.waveFreq = 0.05 + Math.random() * 0.05;
          this.waveAmp = (Math.random() - 0.5) * 45;
        }

        update() {
          this.progress += 0.01 * this.speed;
          
          // Bezier interpolation
          const t = this.progress;
          const currentCore = CORES[activeIndex];
          this.color = currentCore.color;

          // Simple linear interpolation for baseline vector path
          const bx = this.x + (this.targetX - this.x) * t;
          const by = this.y + (this.targetY - this.y) * t;

          // Apply perpendicular sinusoidal offset waves
          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;
          const len = Math.sqrt(dx*dx + dy*dy);
          const px = -dy / len;
          const py = dx / len;

          const wave = Math.sin(t * Math.PI * 4 + this.waveOffset) * this.waveAmp * (1 - t) * t;
          this.x = bx + px * wave;
          this.y = by + py * wave;
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }

      function drawEnergyStreams() {
        ctx.clearRect(0, 0, width, height);

        // Canvas centers
        const cx = width / 2;
        const cy = height / 2;

        const currentCore = CORES[activeIndex];
        const activePanel = document.getElementById(`hsk-panel-${activeIndex}`);

        if (activePanel) {
          const rect = activePanel.getBoundingClientRect();
          const contRect = container.getBoundingClientRect();
          
          // Target point: bottom center of the active front-focused card
          const tx = rect.left - contRect.left + rect.width / 2;
          const ty = rect.top - contRect.top + rect.height;

          // 1. Draw glowing background high-energy vector lines
          ctx.shadowColor = currentCore.color;
          ctx.shadowBlur = 15;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(${currentCore.rgb}, 0.25)`;

          // Swirling wave connectors
          const now = performance.now() * 0.003;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            
            // Draw sinusoidal organic laser strands
            const steps = 30;
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const bx = cx + (tx - cx) * t;
              const by = cy + (ty - cy) * t;

              // Orthogonal vectors
              const dx = tx - cx;
              const dy = ty - cy;
              const len = Math.sqrt(dx*dx + dy*dy);
              const px = -dy / len;
              const py = dx / len;

              const waveAmp = Math.sin(t * Math.PI * 2 - now + i * 2) * 15 * t * (1 - t);
              ctx.lineTo(bx + px * waveAmp, by + py * waveAmp);
            }
            ctx.stroke();
          }
          ctx.shadowBlur = 0;

          // 2. Generate and draw high speed sparks feeding energy
          if (Math.random() < 0.22) {
            particleArray.push(new PlasmaSpark(cx, cy, tx, ty, currentCore.color));
          }

          particleArray.forEach((p, pIdx) => {
            p.update();
            p.draw();
            if (p.progress >= 1) {
              particleArray.splice(pIdx, 1);
            }
          });
        }

        animationFrameId = requestAnimationFrame(drawEnergyStreams);
      }

      drawEnergyStreams();
    }

    /* ─────────────── SCROLL INITIAL TRIGGER ─────────────── */
    // Initialize initial state layout trigger once visible
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        // Snap and fire diagnostic filling animations
        setTurntableAngle(0);
        updateActiveStates(0);
      }
    }, { threshold: 0.1 });
    observer.observe(container);

    // Initial positioning calibration
    updateActiveStates(0);
    setTurntableAngle(0);
  }

  /* ─────────────── BOOT ENGINE ─────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuantumCarousel);
  } else {
    initQuantumCarousel();
  }

})();
