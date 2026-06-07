document.addEventListener("DOMContentLoaded", () => {
  const hero = document.getElementById("home");
  if (!hero) return;

  // Configuration
  const maxTilt = 10; // Max tilt rotation in degrees
  const lerpFactor = 0.06; // Dampening factor for smooth floating (0.01 - 0.2)

  let targetX = 0; // target mouse X normalized (-1 to 1)
  let targetY = 0; // target mouse Y normalized (-1 to 1)
  let currentTiltX = 0; // smoothed X tilt
  let currentTiltY = 0; // smoothed Y tilt

  let isMobile = window.matchMedia("(max-width: 1024px)").matches;
  let isVisible = true;
  let rafId = null;

  // Handle responsiveness
  window.addEventListener("resize", () => {
    isMobile = window.matchMedia("(max-width: 1024px)").matches;
    if (isMobile) {
      resetTilt();
    }
  });

  // Track if hero is visible using IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !isMobile) {
        startLoop();
      } else {
        stopLoop();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(hero);

  // Mouse Move listener
  hero.addEventListener("mousemove", (e) => {
    if (isMobile || !isVisible) return;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates around the center (-1 to 1)
    targetX = ((x / rect.width) * 2 - 1);
    targetY = ((y / rect.height) * 2 - 1);

    // Track relative mouse position inside hero for light reflection CSS gradients
    hero.style.setProperty("--mouse-px-x", `${x}px`);
    hero.style.setProperty("--mouse-px-y", `${y}px`);
    hero.style.setProperty("--mouse-pct-x", `${(x / rect.width * 100).toFixed(1)}%`);
    hero.style.setProperty("--mouse-pct-y", `${(y / rect.height * 100).toFixed(1)}%`);
  });

  // Reset tilt on mouseleave
  hero.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  function resetTilt() {
    targetX = 0;
    targetY = 0;
    currentTiltX = 0;
    currentTiltY = 0;
    hero.style.setProperty("--tilt-x", "0deg");
    hero.style.setProperty("--tilt-y", "0deg");
    hero.style.setProperty("--mouse-pct-x", "50%");
    hero.style.setProperty("--mouse-pct-y", "50%");
  }

  function startLoop() {
    if (!rafId) {
      rafId = requestAnimationFrame(updateTilt);
    }
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function updateTilt() {
    if (isMobile || !isVisible) {
      rafId = null;
      return;
    }

    // Apply linear interpolation for smooth dampening
    // Y cursor position controls rotateX (pitch), and X controls rotateY (yaw)
    const desiredTiltX = -targetY * maxTilt;
    const desiredTiltY = targetX * maxTilt;

    currentTiltX += (desiredTiltX - currentTiltX) * lerpFactor;
    currentTiltY += (desiredTiltY - currentTiltY) * lerpFactor;

    hero.style.setProperty("--tilt-x", `${currentTiltX.toFixed(2)}deg`);
    hero.style.setProperty("--tilt-y", `${currentTiltY.toFixed(2)}deg`);

    rafId = requestAnimationFrame(updateTilt);
  }
});
