/* ==========================================================================
   SCROLLYTELLING 3D REVEAL CONTROLLER
   Tracks viewport coordinates and triggers alternating 3D animations
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".scrolly-card");
  if (revealElements.length === 0) return;

  // Disable 3D scrollytelling reveals if user prefers reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealElements.forEach(el => el.classList.add("active"));
    return;
  }

  // Create highly responsive Intersection Observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        
        // Optionally animate inner lists or child skill bars sequentially
        const delayItems = entry.target.querySelectorAll(".subject-tag");
        delayItems.forEach((item, index) => {
          item.style.transitionDelay = `${index * 0.08}s`;
          item.classList.add("active");
        });

        // Unobserve after firing to make the entrance clean and permanent
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null, // Viewport
    rootMargin: "-80px 0px -80px 0px", // Fire slightly before elements dominate center
    threshold: 0.12 // Trigger as soon as 12% is visible
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
});
