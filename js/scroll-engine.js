// ── SCROLL-DRIVEN FRAME SEQUENCE ENGINE
// Implements the sticky-canvas frame-sequence technique:
// - Preloads all frames with progress tracking
// - RAF-throttled scroll handler (no stacking)
// - Cover-fit canvas drawing with DPR scaling
// - Annotation card visibility management
// - Hero text fade on scroll

(function () {
  'use strict';

  // ── CONFIGURATION
  const FRAME_COUNT = 118;
  const FRAME_PATH = 'assets/frames/frame_';
  const FRAME_EXT = '.jpg';
  const FRAME_PAD = 4;

  // Annotation card visibility zones (scroll progress 0–1)
  const ANNOTATIONS = [
    { id: 'hero-card-1', show: 0.12, hide: 0.32 },
    { id: 'hero-card-2', show: 0.38, hide: 0.58 },
    { id: 'hero-card-3', show: 0.64, hide: 0.84 }
  ];

  // ── DOM REFERENCES
  const heroSection = document.getElementById('hero');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroText = document.getElementById('hero-text');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingBar = document.getElementById('loading-bar');
  const loadingPercent = document.getElementById('loading-percent');

  if (!heroSection || !heroCanvas) return;

  const ctx = heroCanvas.getContext('2d');
  const frames = [];
  let loaded = false;
  let ticking = false;
  let currentFrame = -1;

  // ── CANVAS DPR SIZING (skill pack rule: DPR-aware)
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    heroCanvas.width = w * dpr;
    heroCanvas.height = h * dpr;
    heroCanvas.style.width = w + 'px';
    heroCanvas.style.height = h + 'px';
    // Redraw current frame after resize
    if (loaded && currentFrame >= 0 && frames[currentFrame]) {
      drawFrame(currentFrame);
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ── FRAME PRELOADING
  function padNumber(num, pad) {
    return String(num).padStart(pad, '0');
  }

  let loadedCount = 0;

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = FRAME_PATH + padNumber(i, FRAME_PAD) + FRAME_EXT;
    img.onload = function () {
      loadedCount++;
      const progress = loadedCount / FRAME_COUNT;

      // Update loading UI (direct DOM — no framework overhead)
      if (loadingBar) {
        loadingBar.style.width = (progress * 100) + '%';
      }
      if (loadingPercent) {
        loadingPercent.textContent = Math.round(progress * 100) + '%';
      }

      if (loadedCount === FRAME_COUNT) {
        loaded = true;
        // Draw first frame immediately
        drawFrame(0);
        currentFrame = 0;
        // Fade out loading overlay
        if (loadingOverlay) {
          loadingOverlay.style.opacity = '0';
          loadingOverlay.style.pointerEvents = 'none';
          setTimeout(function () {
            loadingOverlay.style.display = 'none';
          }, 600);
        }
        // Kick off initial scroll position check
        handleScroll();
      }
    };
    img.onerror = function () {
      // Count errors as loaded to prevent infinite loading
      loadedCount++;
      if (loadedCount === FRAME_COUNT) {
        loaded = true;
        if (loadingOverlay) {
          loadingOverlay.style.opacity = '0';
          loadingOverlay.style.pointerEvents = 'none';
        }
      }
    };
    frames.push(img);
  }

  // ── COVER-FIT DRAWING (skill pack reference 03)
  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = heroCanvas.width;   // internal (DPR-scaled)
    const ch = heroCanvas.height;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let drawW, drawH, drawX, drawY;

    if (window.innerWidth > 768) {
      // Desktop: standard cover-fit
      if (canvasRatio > imgRatio) {
        drawW = cw;
        drawH = cw / imgRatio;
      } else {
        drawH = ch;
        drawW = ch * imgRatio;
      }
    } else {
      // Mobile: cover-fit + 1.3× zoom (skill pack rule)
      if (canvasRatio > imgRatio) {
        drawW = cw;
        drawH = cw / imgRatio;
      } else {
        drawH = ch;
        drawW = ch * imgRatio;
      }
      drawW *= 1.3;
      drawH *= 1.3;
    }

    drawX = (cw - drawW) / 2;
    drawY = (ch - drawH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // ── SCROLL HANDLER (RAF + ticking ref — skill pack reference 06)
  let prevVisibleIds = '';

  function handleScroll() {
    if (!loaded) return;
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      const rect = heroSection.getBoundingClientRect();
      const scrollableHeight = heroSection.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));

      // 1. Pick frame and draw (direct DOM — no React state)
      const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
      if (frameIndex !== currentFrame && frames[frameIndex]) {
        currentFrame = frameIndex;
        drawFrame(frameIndex);
      }

      // 2. Hero text fade — first 8% of scroll (skill pack rule)
      if (heroText) {
        const textOpacity = Math.max(0, 1 - progress / 0.08);
        heroText.style.opacity = String(textOpacity);
        // Hide pointer events when invisible for performance
        heroText.style.pointerEvents = textOpacity < 0.01 ? 'none' : 'auto';
      }

      // 3. Annotation card visibility (CSS transitions, not JS animations)
      const newVisible = [];
      for (let i = 0; i < ANNOTATIONS.length; i++) {
        const ann = ANNOTATIONS[i];
        if (progress >= ann.show && progress <= ann.hide) {
          newVisible.push(ann.id);
        }
      }

      // Only update DOM when the visible set actually changes (skill pack rule)
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

  // ── EVENT BINDING (passive — skill pack rule)
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ── SMOOTH SCROLL (lightweight lerp-based — replaces Lenis without npm)
  // Only on desktop, skip on touch devices for native feel
  if (!('ontouchstart' in window) && window.innerWidth > 1024) {
    let scrollTarget = window.scrollY;
    let scrollCurrent = window.scrollY;
    let scrolling = false;
    const LERP = 0.08; // Lower = smoother, higher = snappier (Lenis uses 0.07–0.1)

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
