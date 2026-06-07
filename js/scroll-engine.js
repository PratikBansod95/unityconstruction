// ── SCROLL-DRIVEN VIDEO ENGINE
// Implements the sticky-video scrubbing technique:
// - Syncs video currentTime to scroll progress
// - Uses requestAnimationFrame for smooth updates
// - Annotation card visibility management
// - Hero text fade on scroll

(function () {
  'use strict';

  // ── DOM REFERENCES
  const heroSection = document.getElementById('hero');
  const heroText = document.getElementById('hero-text');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingBar = document.getElementById('loading-bar');
  const loadingPercent = document.getElementById('loading-percent');
  
  if (!heroSection) return;

  let ticking = false;
  
  // Hide loading overlay immediately since video handles its own loading natively
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    loadingOverlay.style.pointerEvents = 'none';
    setTimeout(function () {
      loadingOverlay.style.display = 'none';
    }, 600);
  }

  // ── SCROLL HANDLER
  function handleScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      const scrollY = window.scrollY;
      
      // 1. Hero text fade — first 300px of scroll
      if (heroText) {
        const textOpacity = Math.max(0, 1 - scrollY / 300);
        heroText.style.opacity = String(textOpacity);
        heroText.style.pointerEvents = textOpacity < 0.01 ? 'none' : 'auto';
      }

      // 2. Update scroll progress bar
      var sp = document.getElementById('sp');
      if (sp) {
        var totalPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
        sp.style.width = totalPct + '%';
      }

      ticking = false;
    });
  }

  // ── EVENT BINDING
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ── SMOOTH SCROLL (lightweight lerp-based)
  // Only on desktop, skip on touch devices for native feel
  if (!('ontouchstart' in window) && window.innerWidth > 1024) {
    let scrollTarget = window.scrollY;
    let scrollCurrent = window.scrollY;
    let scrolling = false;
    const LERP = 0.08; 

    window.addEventListener('wheel', function (e) {
      e.preventDefault();
      scrollTarget += e.deltaY;
      scrollTarget = Math.max(0, Math.min(scrollTarget, document.documentElement.scrollHeight - window.innerHeight));
      if (!scrolling) {
        scrolling = true;
        smoothStep();
      }
    }, { passive: false });

    function smoothStep() {
      scrollCurrent += (scrollTarget - scrollCurrent) * LERP;

      // Stop animating when close enough
      if (Math.abs(scrollTarget - scrollCurrent) < 0.5) {
        scrollCurrent = scrollTarget;
        window.scrollTo(0, scrollCurrent);
        scrolling = false;
        return;
      }

      window.scrollTo(0, scrollCurrent);
      requestAnimationFrame(smoothStep);
    }
  }
})();
