/* ==========================================================================
   INTERACTIVE 3D PERSPECTIVE TILT & REFLECTION GLARE ENGINE
   Applies dynamic mouse-tracking tilt and reflective spotlight glare
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card, .scrolly-card, .profile-card");
  if (cards.length === 0) return;

  // Don't apply interactive tilt if reduced motion is preferred
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse relative X inside the card
      const y = e.clientY - rect.top;  // Mouse relative Y inside the card
      
      const width = rect.width;
      const height = rect.height;
      
      // Calculate rotation angles (-12deg to 12deg)
      const rotateX = ((y / height) - 0.5) * -14;
      const rotateY = ((x / width) - 0.5) * 14;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      
      // EYE-DAZZLER RADIAL REFLECTION GLARE: Update css variables representing coordinates
      card.style.setProperty("--mouse-x", `${(x / width) * 100}%`);
      card.style.setProperty("--mouse-y", `${(y / height) * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      // Smooth reset
      card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
});
