/* ==========================================================================
   LEETCODE STATS LOAD CONTROLLER
   Animates dial gauges and solved counters on visibility entries
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const solvedDial = document.getElementById("leetDial");
  const solvedCount = document.getElementById("solvedCount");
  const profilesSec = document.getElementById("profiles");
  let statsAnimated = false;

  const animateLeetDials = () => {
    if (solvedDial && solvedCount) {
      solvedDial.style.strokeDashoffset = "251.2";
      
      setTimeout(() => {
        let count = 0;
        const targetCount = 750;
        const speed = 2000 / targetCount;
        
        const counter = setInterval(() => {
          count += 5;
          solvedCount.textContent = count;
          if (count >= targetCount) {
            solvedCount.textContent = targetCount;
            clearInterval(counter);
          }
        }, speed * 5);
        
        // Solve ratio fill (750 solved / 900 total = 83.3%)
        solvedDial.style.strokeDashoffset = "41.8";
      }, 300);
    }
  };

  // Trigger loading when profiles section enters viewport
  const profilesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        animateLeetDials();
        statsAnimated = true;
        profilesObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  if (profilesSec) {
    profilesObserver.observe(profilesSec);
  }
});
