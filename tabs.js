/* ==========================================================================
   TAB NAVIGATION SYSTEM
   Coordinates pane switching for Resume and Activities sections
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Resume Section Tabs
  const resumeTabs = document.querySelectorAll(".resume-tab");
  const resumePanels = document.querySelectorAll(".resume-panel");
  
  resumeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      resumeTabs.forEach(t => t.classList.remove("active"));
      resumePanels.forEach(p => p.classList.remove("active"));
      
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-target");
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add("active");
        
        // Re-trigger fills on skill bar charts on transition
        const fills = activePanel.querySelectorAll(".skill-fill");
        fills.forEach(fill => {
          const width = fill.style.width;
          fill.style.width = "0";
          setTimeout(() => {
            fill.style.width = width;
          }, 50);
        });
      }
    });
  });

  // 2. Activities Section Tabs
  const activityBtns = document.querySelectorAll(".activity-btn");
  const activityPanels = document.querySelectorAll(".activity-panel");
  
  activityBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      activityBtns.forEach(b => b.classList.remove("active"));
      activityPanels.forEach(p => p.classList.remove("active"));
      
      btn.classList.add("active");
      const targetActivity = btn.getAttribute("data-activity");
      const activePanel = document.getElementById(`act-${targetActivity}`);
      if (activePanel) {
        activePanel.classList.add("active");
      }
    });
  });
});
