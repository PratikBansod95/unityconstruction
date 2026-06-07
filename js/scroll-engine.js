// ── SCROLL-DRIVEN VIDEO ENGINE
// Implements the sticky-video scrubbing technique:
// - Syncs video currentTime to scroll progress
// - Uses requestAnimationFrame for smooth updates
// - Annotation card visibility management
// - Hero text fade on scroll

(function () {
  'use strict';

  // Annotation card visibility zones (scroll progress 0–1)
  const ANNOTATIONS = [
    { id: 'hero-card-1', show: 0.12, hide: 0.32 },
    { id: 'hero-card-2', show: 0.38, hide: 0.58 },
    { id: 'hero-card-3', show: 0.64, hide: 0.84 }
  ];

  // ── DOM REFERENCES
  const heroSection = document.getElementById('hero');
  const heroVideo = document.getElementById('hero-video');
  const heroText = document.getElementById('hero-text');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingBar = document.getElementById('loading-bar');
  const loadingPercent = document.getElementById('loading-percent');
  
  if (!heroSection || !heroVideo) return;

  let ticking = false;
  let videoLoaded = false;
  let prevVisibleIds = '';
  
  // Ensure the video is loaded enough to scrub
  heroVideo.addEventListener('loadedmetadata', () => {
    videoLoaded = true;
    
    if (loadingBar) {
        loadingBar.style.width = '100%';
    }
    if (loadingPercent) {
        loadingPercent.textContent = '100%';
    }

    // Hide loading overlay since video is ready
    if (loadingOverlay) {
      loadingOverlay.style.opacity = '0';
      loadingOverlay.style.pointerEvents = 'none';
      setTimeout(function () {
        loadingOverlay.style.display = 'none';
      }, 600);
    }
    
    handleScroll();
  }, { once: true });
  
  // Force load to ensure loadedmetadata fires
  heroVideo.load();

  let targetVideoTime = 0;
  let currentVideoTime = 0;

  // Continuous loop to smoothly interpolate video scrub (Lerp)
  function renderLoop() {
    if (videoLoaded && heroVideo.duration) {
      // Smoothly approach the target time
      currentVideoTime += (targetVideoTime - currentVideoTime) * 0.08;
      
      // Only update DOM if the change is meaningful to save CPU
      if (Math.abs(targetVideoTime - currentVideoTime) > 0.001) {
        heroVideo.currentTime = currentVideoTime;
      }
    }
    requestAnimationFrame(renderLoop);
  }
  
  // Start the render loop
  requestAnimationFrame(renderLoop);

  // ── SCROLL HANDLER
  function handleScroll() {
    if (!videoLoaded) return;
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      const rect = heroSection.getBoundingClientRect();
      const scrollableHeight = heroSection.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));

      // 1. Update target video time for the lerp loop
      if (heroVideo.duration) {
        targetVideoTime = Math.min(progress * heroVideo.duration, heroVideo.duration - 0.01);
      }

      // 2. Hero text fade — first 8% of scroll
      if (heroText) {
        const textOpacity = Math.max(0, 1 - progress / 0.08);
        heroText.style.opacity = String(textOpacity);
        heroText.style.pointerEvents = textOpacity < 0.01 ? 'none' : 'auto';
      }

      // 3. Annotation card visibility
      const newVisible = [];
      for (let i = 0; i < ANNOTATIONS.length; i++) {
        const ann = ANNOTATIONS[i];
        if (progress >= ann.show && progress <= ann.hide) {
          newVisible.push(ann.id);
        }
      }

      const newIds = newVisible.sort().join(',');
      if (newIds !== prevVisibleIds) {
        prevVisibleIds = newIds;
        for (let i = 0; i < ANNOTATIONS.length; i++) {
          const el = document.getElementById(ANNOTATIONS[i].id);
          if (el) {
            const isVisible = newVisible.indexOf(ANNOTATIONS[i].id) !== -1;
            if (isVisible) {
              el.classList.add('hero-card-visible');
              el.classList.remove('hero-card-hidden');
            } else {
              el.classList.remove('hero-card-visible');
              el.classList.add('hero-card-hidden');
            }
          }
        }
      }

      // 4. Update scroll progress bar
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
