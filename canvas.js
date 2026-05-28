/* ==========================================================================
   CANVAS PARTICLES SYSTEM WITH MOUSE WARP SPEED & NEURAL SPARKS
   High-performance ambient gold networks with advanced physics loops
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particlesCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let sparks = []; // Small traveling neural pulses
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  let mouse = { x: null, y: null, radius: 150 };
  let lastMouseX = null, lastMouseY = null;
  let mouseSpeed = 0; // Warp drive scale

  // Track cursor velocity
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (lastMouseX !== null && lastMouseY !== null) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      mouseSpeed = Math.min(25, Math.hypot(dx, dy)); // Cap maximum warp drive stretch
    }
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
    mouseSpeed = 0;
  });

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.baseVx = this.vx;
      this.baseVy = this.vy;
      this.radius = Math.random() * 1.5 + 0.6;
      this.density = Math.random() * 20 + 2;
    }

    update() {
      // Repulsion logic
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const forceX = (dx / distance) * force * this.density * 0.4;
          const forceY = (dy / distance) * force * this.density * 0.4;

          this.x -= forceX;
          this.y -= forceY;
        } else {
          this.vx += (this.baseVx - this.vx) * 0.05;
          this.vy += (this.baseVy - this.vy) * 0.05;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap boundaries
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      // EYE-DAZZLER WARP DRIVE STRETCH: If mouse speed is high, draw line streaks!
      if (mouseSpeed > 5) {
        const stretchX = this.vx * (mouseSpeed * 1.5);
        const stretchY = this.vy * (mouseSpeed * 1.5);
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + stretchX, this.y + stretchY);
        ctx.strokeStyle = "hsla(42, 45%, 58%, 0.25)";
        ctx.lineWidth = this.radius;
        ctx.stroke();
      } else {
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(42, 45%, 58%, 0.18)";
        ctx.fill();
      }
    }
  }

  // Neural Spark pulse traveler
  class Spark {
    constructor(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
      this.progress = 0;
      this.speed = Math.random() * 0.02 + 0.015;
    }
    update() {
      this.progress += this.speed;
    }
    draw() {
      // Calculate current location along the line path
      const currentX = this.p1.x + (this.p2.x - this.p1.x) * this.progress;
      const currentY = this.p1.y + (this.p2.y - this.p1.y) * this.progress;

      ctx.beginPath();
      ctx.arc(currentX, currentY, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(42, 60%, 75%, 0.8)";
      ctx.shadowColor = "var(--gold-primary)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset canvas shadows
    }
  }

  const initParticles = () => {
    particles = [];
    sparks = [];
    const count = Math.min(50, Math.floor((width * height) / 28000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  };
  initParticles();

  // Create sparks on random line connections periodically
  setInterval(() => {
    if (particles.length === 0) return;
    const p1 = particles[Math.floor(Math.random() * particles.length)];
    // Find close matching particle
    const neighbors = particles.filter(p2 => p2 !== p1 && Math.hypot(p1.x - p2.x, p1.y - p2.y) < 150);
    if (neighbors.length > 0 && sparks.length < 15) {
      const p2 = neighbors[Math.floor(Math.random() * neighbors.length)];
      sparks.push(new Spark(p1, p2));
    }
  }, 100);

  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / 150) * 0.05;
          ctx.strokeStyle = `hsla(42, 45%, 58%, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  const animateParticles = () => {
    ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    drawLines();

    // Update & draw sparks
    sparks.forEach((s, idx) => {
      s.update();
      s.draw();
      if (s.progress >= 1) {
        sparks.splice(idx, 1); // Delete reached spark
      }
    });

    // Gradually ease mouse speed down when stationary
    mouseSpeed *= 0.95;

    requestAnimationFrame(animateParticles);
  };
  animateParticles();
});
