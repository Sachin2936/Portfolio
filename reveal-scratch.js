/* ================================================================
   SCRATCH-TO-REVEAL — Spiderman → Real Photo
   ================================================================ */
(function initScratchReveal() {
  const canvas   = document.getElementById('reveal-canvas');
  const hint     = document.getElementById('reveal-hint');
  const frame    = document.getElementById('photo-tilt');
  if (!canvas || !frame) return;

  const ctx = canvas.getContext('2d');
  const SIZE = 400; // canvas resolution matches the frame size
  canvas.width  = SIZE;
  canvas.height = SIZE;

  /* ── Load Spiderman image ── */
  const spiderImg = new Image();
  spiderImg.src   = 'batman.png';

  let restoreTimer   = null;
  let isRestoring    = false;
  let revealedPixels = 0;
  let hasStarted     = false; // whether user touched the canvas

  /* Draw the Spiderman mask cleanly */
  function drawMask(alpha) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    // circular clip so image stays round
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.drawImage(spiderImg, 0, 0, SIZE, SIZE);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  spiderImg.onload = () => {
    drawMask(1);
  };

  /* ── Brush erase on mousemove ── */
  canvas.addEventListener('mousemove', e => {
    if (isRestoring) return;

    if (!hasStarted) {
      hasStarted = true;
      if (hint) hint.style.opacity = '0';
    }

    clearTimeout(restoreTimer);

    const rect = canvas.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const x = (e.clientX - rect.left)  * scaleX;
    const y = (e.clientY - rect.top)   * scaleY;

    // Erase a circle at cursor position
    ctx.save();
    // clip to circle
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.globalCompositeOperation = 'destination-out';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 55);
    grad.addColorStop(0,   'rgba(0,0,0,1)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalCompositeOperation = 'source-over';

    // Auto-restore if idle for 2.5s
    restoreTimer = setTimeout(() => restoreMask(), 2500);
  });

  /* Touch support */
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    }));
  }, { passive: false });

  /* ── Restore Spiderman when cursor leaves ── */
  canvas.addEventListener('mouseleave', () => {
    clearTimeout(restoreTimer);
    restoreTimer = setTimeout(() => restoreMask(), 400);
  });

  /* ── Animated restore: fade Spiderman back in ── */
  function restoreMask() {
    if (isRestoring) return;
    isRestoring = true;
    hasStarted  = false;
    if (hint) hint.style.opacity = '1';

    let alpha = 0;
    const FPS = 60;
    const DUR = 800; // ms
    const STEP = 1000 / FPS;
    const increment = 1 / (DUR / STEP);

    function fadeIn() {
      if (alpha >= 1) {
        drawMask(1);
        isRestoring = false;
        return;
      }
      drawMask(alpha);
      alpha = Math.min(alpha + increment, 1);
      requestAnimationFrame(fadeIn);
    }

    // First clear fully so we can fade in fresh
    ctx.clearRect(0, 0, SIZE, SIZE);
    fadeIn();
  }

})();
